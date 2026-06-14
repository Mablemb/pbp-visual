<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Npc;
use App\Models\NpcExpression;
use App\Services\ImageGeneration\ImageInput;
use App\Services\ImageGeneration\ImageLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function store(Request $request, Campaign $campaign, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'portrait')) {
            $data['portrait_path'] = $library->acquire($input, $campaign, 'npcs', 'Retrato');
        }

        $npc = $campaign->npcs()->create($data);

        if (! empty($data['portrait_path'])) {
            $this->seedNeutral($npc, $data['portrait_path']);
        }

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

    public function update(Request $request, Npc $npc, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $data = $this->validated($request);

        if ($input = ImageInput::fromRequest($request, 'portrait')) {
            $oldPath = $npc->portrait_path;
            $data['portrait_path'] = $library->acquire($input, $npc->campaign, 'npcs', 'Retrato');
            if ($oldPath && $oldPath !== $data['portrait_path']) {
                $library->release($oldPath);
            }
        }

        $npc->update($data);

        if (! empty($data['portrait_path']) && $npc->expressions()->count() === 0) {
            $this->seedNeutral($npc, $data['portrait_path']);
        }

        return redirect()->route('npcs.edit', $npc);
    }

    public function destroyPortrait(Npc $npc, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        if ($npc->portrait_path) {
            $path = $npc->portrait_path;
            $npc->update(['portrait_path' => null]);
            $library->release($path);
        }

        return back();
    }

    public function destroy(Npc $npc, ImageLibrary $library): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $campaignId = $npc->campaign_id;

        // Collect every image this NPC referenced, delete it (expressions
        // cascade), then release each unique path so shared/gallery images
        // survive while orphaned files are cleaned up.
        $paths = $npc->expressions()->pluck('sprite_path')->all();
        $paths[] = $npc->portrait_path;
        $npc->delete();

        foreach (array_unique(array_filter($paths)) as $path) {
            $library->release($path);
        }

        return redirect()->route('campaigns.show', $campaignId);
    }

    /** Reuse the portrait as the default "neutral" sprite (same file). */
    private function seedNeutral(Npc $npc, string $path): void
    {
        $npc->expressions()->create([
            'label' => 'neutral',
            'sprite_path' => $path,
            'is_default' => true,
        ]);
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
