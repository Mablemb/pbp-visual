<?php

namespace App\Http\Controllers;

use App\Models\Npc;
use App\Models\NpcExpression;
use App\Services\ImageGeneration\ImageInput;
use App\Services\ImageGeneration\ImageLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class NpcExpressionController extends Controller
{
    public function store(Request $request, Npc $npc, ImageLibrary $library): RedirectResponse
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
                'sprite_source' => 'Escolha entre upload, geração por IA ou galeria.',
            ]);
        }

        $spritePath = $library->acquire(
            $input,
            $npc->campaign,
            'npcs',
            $request->string('label')->toString(),
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

    public function destroy(Npc $npc, NpcExpression $expression, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        abort_unless($expression->npc_id === $npc->id, 404);

        $path = $expression->sprite_path;
        $expression->delete();
        $library->release($path);

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
