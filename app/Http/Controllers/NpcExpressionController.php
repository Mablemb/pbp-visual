<?php

namespace App\Http\Controllers;

use App\Models\Npc;
use App\Models\NpcExpression;
use App\Services\ImageGeneration\ImageGenerator;
use App\Services\ImageGeneration\ImageInput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class NpcExpressionController extends Controller
{
    public function store(Request $request, Npc $npc, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $request->validate([
            'label' => [
                'required', 'string', 'max:40',
                Rule::unique('npc_expressions', 'label')
                    ->where(fn ($q) => $q->where('npc_id', $npc->id)),
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
            "campaigns/{$npc->campaign_id}/sprites/{$npc->id}",
        );

        $isDefault = $request->boolean('is_default');

        if ($isDefault) {
            $npc->expressions()->update(['is_default' => false]);
        }

        $npc->expressions()->create([
            'label' => $request->string('label')->toString(),
            'sprite_path' => $spritePath,
            'is_default' => $isDefault,
        ]);

        return back();
    }

    public function destroy(Npc $npc, NpcExpression $expression): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        abort_unless($expression->npc_id === $npc->id, 404);

        if ($expression->sprite_path) {
            Storage::disk('public')->delete($expression->sprite_path);
        }
        $expression->delete();

        return back();
    }

    public function setDefault(Npc $npc, NpcExpression $expression): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        abort_unless($expression->npc_id === $npc->id, 404);

        $npc->expressions()->where('id', '!=', $expression->id)->update(['is_default' => false]);
        $expression->update(['is_default' => true]);

        return back();
    }
}
