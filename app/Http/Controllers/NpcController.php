<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Npc;
use App\Models\NpcExpression;
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

    public function store(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

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

    public function update(Request $request, Npc $npc): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $npc->update($request->validate([
            'name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]));

        return redirect()->route('npcs.edit', $npc);
    }

    public function destroy(Npc $npc): RedirectResponse
    {
        $this->authorize('manage', $npc->campaign);

        $campaignId = $npc->campaign_id;
        // TODO: delete sprite files; left as exercise.
        $npc->delete();

        return redirect()->route('campaigns.show', $campaignId);
    }
}
