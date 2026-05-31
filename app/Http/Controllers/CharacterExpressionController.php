<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\CharacterExpression;
use App\Services\ImageGeneration\ImageGenerator;
use App\Services\ImageGeneration\ImageInput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CharacterExpressionController extends Controller
{
    public function store(Request $request, Character $character, ImageGenerator $images): RedirectResponse
    {
        $this->authorizeEdit($request, $character);

        $request->validate([
            'label' => [
                'required', 'string', 'max:40',
                Rule::unique('character_expressions', 'label')
                    ->where(fn ($q) => $q->where('character_id', $character->id)),
            ],
            'is_default' => ['sometimes', 'boolean'],
            ...ImageInput::rules('sprite', required: true),
        ]);

        $input = ImageInput::fromRequest($request, 'sprite');
        if (! $input) {
            throw ValidationException::withMessages([
                'sprite_source' => 'Escolha entre upload ou geração por IA.',
            ]);
        }

        $spritePath = $images->acquire(
            $input,
            "campaigns/{$character->campaign_id}/character-sprites/{$character->id}",
        );

        $isDefault = $request->boolean('is_default');

        if ($isDefault) {
            $character->expressions()->update(['is_default' => false]);
        }

        $character->expressions()->create([
            'label' => $request->string('label')->toString(),
            'sprite_path' => $spritePath,
            'is_default' => $isDefault,
        ]);

        return back();
    }

    public function destroy(Request $request, Character $character, CharacterExpression $expression): RedirectResponse
    {
        $this->authorizeEdit($request, $character);

        abort_unless($expression->character_id === $character->id, 404);

        if ($expression->sprite_path) {
            Storage::disk('public')->delete($expression->sprite_path);
        }
        $expression->delete();

        return back();
    }

    public function setDefault(Request $request, Character $character, CharacterExpression $expression): RedirectResponse
    {
        $this->authorizeEdit($request, $character);

        abort_unless($expression->character_id === $character->id, 404);

        $character->expressions()->where('id', '!=', $expression->id)->update(['is_default' => false]);
        $expression->update(['is_default' => true]);

        return back();
    }

    private function authorizeEdit(Request $request, Character $character): void
    {
        abort_unless(
            $character->user_id === $request->user()->id
                || $character->campaign->dm_user_id === $request->user()->id,
            403,
        );
    }
}
