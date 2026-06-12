<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    /** List campaigns the current user owns OR plays in. */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $owned = Campaign::where('dm_user_id', $user->id)
            ->latest()->get(['id', 'name', 'synopsis']);

        $playing = $user->campaigns_as_player()
            ->latest('campaigns.created_at')
            ->get(['campaigns.id', 'campaigns.name', 'campaigns.synopsis']);

        return Inertia::render('Campaigns/Index', [
            'owned' => $owned,
            'playing' => $playing,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Campaigns/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:250'],
            'synopsis' => ['nullable', 'string', 'max:2000'],
        ]);

        $campaign = $request->user()->campaigns_as_dm()->create($data);

        return redirect()->route('campaigns.show', $campaign);
    }

    public function show(Request $request, Campaign $campaign): Response
    {
        $this->authorize('view', $campaign);

        $campaign->load([
            'dm:id,name,email',
            'players:id,name,email',
            'locations:id,campaign_id,name,description,background_path',
            'npcs:id,campaign_id,name,role,description,portrait_path',
            'npcs.expressions:id,npc_id,label,sprite_path,is_default',
            'characters:id,campaign_id,user_id,name,race,class,level,hp_current,hp_max,portrait_path',
            'characters.user:id,name',
            'quests:id,campaign_id,title,description,status',
            'scenes:id,campaign_id,location_id,title,summary,status,published_at',
        ]);

        return Inertia::render('Campaigns/Show', [
            'campaign' => $campaign,
            'isDm' => $campaign->dm_user_id === $request->user()->id,
        ]);
    }

    public function edit(Campaign $campaign): Response
    {
        $this->authorize('update', $campaign);

        return Inertia::render('Campaigns/Edit', ['campaign' => $campaign]);
    }

    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorize('update', $campaign);

        $campaign->update($request->validate([
            'name' => ['required', 'string', 'max:120'],
            'synopsis' => ['nullable', 'string', 'max:10000'],
        ]));

        return redirect()->route('campaigns.show', $campaign);
    }

    public function destroy(Campaign $campaign): RedirectResponse
    {
        $this->authorize('delete', $campaign);
        $campaign->delete();

        return redirect()->route('campaigns.index');
    }
}
