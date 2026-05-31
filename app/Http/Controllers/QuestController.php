<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Quest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class QuestController extends Controller
{
    public function create(Campaign $campaign): Response
    {
        $this->authorize('manage', $campaign);

        return Inertia::render('Quests/Create', [
            'campaign' => $campaign->only('id', 'name'),
            'statuses' => Quest::STATUSES,
        ]);
    }

    public function store(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $campaign->quests()->create($this->validated($request));

        return redirect()->route('campaigns.show', $campaign);
    }

    public function edit(Quest $quest): Response
    {
        $this->authorize('manage', $quest->campaign);

        return Inertia::render('Quests/Edit', [
            'quest' => $quest,
            'campaign' => $quest->campaign->only('id', 'name'),
            'statuses' => Quest::STATUSES,
        ]);
    }

    public function update(Request $request, Quest $quest): RedirectResponse
    {
        $this->authorize('manage', $quest->campaign);

        $quest->update($this->validated($request));

        return redirect()->route('campaigns.show', $quest->campaign_id);
    }

    public function destroy(Quest $quest): RedirectResponse
    {
        $this->authorize('manage', $quest->campaign);

        $campaignId = $quest->campaign_id;
        $quest->delete();

        return redirect()->route('campaigns.show', $campaignId);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(Quest::STATUSES)],
        ]);
    }
}
