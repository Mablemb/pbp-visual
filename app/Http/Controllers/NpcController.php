<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Npc;
use App\Models\NpcExpression;
use App\Services\ImageGeneration\ImageGenerator;
use App\Services\ImageGeneration\ImageInput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class NpcController extends Controller
{
    public function create(Campaign $campaign): Response
    {
        $this->authorize('manage', $campaign);

        return Inertia::render('Npcs/Create', [
            'campaign' => $campaign->only('id', 'name'),
        ]);
    }

    public function store(Request $request, Campaign $campaign, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'portrait')) {
            $data['portrait_path'] = $images->acquire(
                $input,
                "campaigns/{$campaign->id}/portraits",
            );
        }

        $npc = $campaign->npcs()->create($data);

        return redirect()->route('npcs.edit', $npc);
    }

    public function edit(Npc $npc): Response
    {
        $this->authorize('manage', $npc->campaign);

        $npc->load('expressions');

        return Inertia::render('Npcs/Edit', [
            'npc' => $npc,
            'campaign' => $npc->campaign->only('id', 'name'),
            'expressionLabels' => NpcExpression::LABELS,
        ]);
    }

    public function update(Request $request, Npc $npc, ImageGenerator $images): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'portrait')) {
            if ($npc->portrait_path) {
                Storage::disk('public')->delete($npc->portrait_path);
            }
            $data['portrait_path'] = $images->acquire(
                $input,
                "campaigns/{$npc->campaign_id}/portraits",
            );
        }

        $npc->update($data);

        return redirect()->route('npcs.edit', $npc);
    }

    public function destroyPortrait(Npc $npc): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        if ($npc->portrait_path) {
            Storage::disk('public')->delete($npc->portrait_path);
            $npc->update(['portrait_path' => null]);
        }

        return back();
    }

    public function destroy(Npc $npc): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $campaignId = $npc->campaign_id;
        if ($npc->portrait_path) {
            Storage::disk('public')->delete($npc->portrait_path);
        }
        $npc->delete();

        return redirect()->route('campaigns.show', $campaignId);
    }

    private function validated(Request $request): array
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'race' => ['nullable', 'string', 'max:60'],
            'class' => ['nullable', 'string', 'max:60'],
            'level' => ['required', 'integer', 'min:1', 'max:20'],
            'hp_max' => ['required', 'integer', 'min:1', 'max:999'],
            'hp_current' => ['required', 'integer', 'min:0', 'max:999'],
            'strength' => ['required', 'integer', 'min:1', 'max:30'],
            'dexterity' => ['required', 'integer', 'min:1', 'max:30'],
            'constitution' => ['required', 'integer', 'min:1', 'max:30'],
            'intelligence' => ['required', 'integer', 'min:1', 'max:30'],
            'wisdom' => ['required', 'integer', 'min:1', 'max:30'],
            'charisma' => ['required', 'integer', 'min:1', 'max:30'],
            'bio' => ['nullable', 'string', 'max:5000'],
            ...ImageInput::rules('portrait'),
        ]);

        return $request->only([
            'name', 'role', 'description',
            'race', 'class', 'level', 'hp_max', 'hp_current',
            'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
            'bio',
        ]);
    }
}
