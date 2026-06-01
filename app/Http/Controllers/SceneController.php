<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Scene;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * DM-side CRUD for scenes plus player-facing viewer (show).
 *
 * Scenes are nested under campaigns (shallow): list/create/store live
 * under /campaigns/{campaign}/scenes; edit/update/destroy/show live at
 * /scenes/{scene}/...
 */
class SceneController extends Controller
{
    public function create(Campaign $campaign): Response
    {
        $this->authorize('manage', $campaign);

        return Inertia::render('Scenes/Create', [
            'campaign' => $campaign->only('id', 'name'),
            'locations' => $campaign->locations()->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, Campaign $campaign): RedirectResponse
    {
        $this->authorize('manage', $campaign);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
        ]);

        $scene = $campaign->scenes()->create([
            ...$data,
            'status' => Scene::STATUS_DRAFT,
        ]);

        return redirect()->route('scenes.edit', $scene);
    }

    /** Player-facing visual-novel viewer. */
    public function show(Request $request, Scene $scene): Response
    {
        $this->authorize('view', $scene->campaign);

        $isDm = $scene->campaign->dm_user_id === $request->user()->id;

        // Players can only see published scenes; DM can preview drafts.
        abort_unless($isDm || $scene->isPublished(), 404);

        $scene->load([
            'campaign:id,name,dm_user_id',
            'location:id,name,background_path',
            'lines.npc:id,name',
            'lines.expression:id,sprite_path,label',
            'lines.character:id,name,portrait_path',
            'lines.characterExpression:id,sprite_path,label,character_id',
            'lines.damageEvents.character:id,name,portrait_path,hp_current,hp_max',
            'lines.damageEvents.npc:id,name,portrait_path,hp_current,hp_max',
            'actions' => fn ($q) => $q->latest()->with(['user:id,name', 'character:id,name']),
        ]);

        // Characters the current user owns in this campaign (for picking who acts).
        $myCharacters = $request->user()
            ->characters()
            ->where('campaign_id', $scene->campaign_id)
            ->with('expressions:id,character_id,label,sprite_path,is_default')
            ->get(['id', 'name']);

        return Inertia::render('Scenes/Show', [
            'scene' => $scene,
            'isDm' => $isDm,
            'myCharacters' => $myCharacters,
        ]);
    }

    public function edit(Scene $scene): Response
    {
        $this->authorize('manage', $scene->campaign);

        $scene->load([
            'campaign:id,name',
            'location:id,name,background_path',
            'lines.npc:id,name',
            'lines.expression:id,sprite_path,label,npc_id',
            'lines.character:id,name,portrait_path',
            'lines.characterExpression:id,sprite_path,label,character_id',
            'lines.damageEvents.character:id,name,portrait_path,hp_current,hp_max',
            'lines.damageEvents.npc:id,name,portrait_path,hp_current,hp_max',
        ]);

        $campaign = $scene->campaign;

        $pendingActions = $scene->actions()
            ->where('status', \App\Models\PlayerAction::STATUS_PENDING)
            ->with([
                'character:id,name,portrait_path',
                'characterExpression:id,sprite_path,label,character_id',
                'user:id,name',
            ])
            ->orderBy('created_at')
            ->get();

        // Characters available in this campaign (so DM can also add player
        // lines manually with expressions).
        $characters = $campaign->characters()
            ->with('expressions:id,character_id,label,sprite_path,is_default')
            ->get(['id', 'name', 'portrait_path']);

        return Inertia::render('Scenes/Edit', [
            'scene' => $scene,
            'campaign' => $campaign->only('id', 'name'),
            'locations' => $campaign->locations()->get(['id', 'name', 'background_path']),
            'npcs' => $campaign->npcs()->with('expressions:id,npc_id,label,sprite_path,is_default')
                ->get(['id', 'name', 'portrait_path', 'hp_current', 'hp_max']),
            'characters' => $characters,
            'pendingActions' => $pendingActions,
        ]);
    }

    public function update(Request $request, Scene $scene): RedirectResponse
    {
        $this->authorize('manage', $scene->campaign);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if (($data['status'] ?? null) === Scene::STATUS_PUBLISHED && ! $scene->isPublished()) {
            $data['published_at'] = now();
        }

        $scene->update($data);

        return back();
    }

    public function destroy(Scene $scene): RedirectResponse
    {
        $this->authorize('manage', $scene->campaign);
        $campaignId = $scene->campaign_id;
        $scene->delete();

        return redirect()->route('campaigns.show', $campaignId);
    }
}
