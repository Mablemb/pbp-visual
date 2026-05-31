<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\PlayerAction;
use App\Models\Scene;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Free-text actions players post after reading a scene; DM resolves with
 * optional notes about how it played out at the table / next session.
 */
class PlayerActionController extends Controller
{
    /** DM inbox: every action of a campaign grouped by status. */
    public function index(Campaign $campaign): Response
    {
        $this->authorize('manage', $campaign);

        $actions = PlayerAction::query()
            ->whereIn('scene_id', $campaign->scenes()->select('id'))
            ->with([
                'scene:id,campaign_id,title',
                'user:id,name',
                'character:id,name',
            ])
            ->latest()
            ->get();

        return Inertia::render('PlayerActions/Index', [
            'campaign' => $campaign->only('id', 'name'),
            'actions' => $actions,
        ]);
    }

    /** Player submits an action on a scene. */
    public function store(Request $request, Scene $scene): RedirectResponse
    {
        $this->authorize('view', $scene->campaign);

        // Players can only post on published scenes; DM can post on drafts
        // too (useful for "GM example" notes), but typical flow is players.
        $isDm = $scene->campaign->dm_user_id === $request->user()->id;
        if (! $isDm && ! $scene->isPublished()) {
            throw new AuthorizationException();
        }

        $data = $request->validate([
            'kind' => ['required', 'in:action,dialogue'],
            'body' => ['required', 'string', 'max:4000'],
            'character_id' => ['nullable', 'integer', 'exists:characters,id'],
            'character_expression_id' => ['nullable', 'integer', 'exists:character_expressions,id'],
        ]);

        // If a character is given, it must belong to this user AND campaign.
        if (! empty($data['character_id'])) {
            $owns = $request->user()->characters()
                ->where('campaign_id', $scene->campaign_id)
                ->whereKey($data['character_id'])
                ->exists();
            if (! $owns) {
                throw new AuthorizationException('Personagem inválido para esta campanha.');
            }
        }

        // Expression must belong to that character.
        if (! empty($data['character_expression_id'])) {
            $valid = \App\Models\CharacterExpression::where('id', $data['character_expression_id'])
                ->where('character_id', $data['character_id'])
                ->exists();
            if (! $valid) {
                $data['character_expression_id'] = null;
            }
        }

        $scene->actions()->create([
            ...$data,
            'user_id' => $request->user()->id,
            'status' => PlayerAction::STATUS_PENDING,
        ]);

        return redirect()->route('scenes.show', $scene)->with('flash', 'Ação registrada.');
    }

    /** DM resolves (or re-opens) an action with optional notes. */
    public function update(Request $request, PlayerAction $action): RedirectResponse
    {
        $this->authorize('manage', $action->scene->campaign);

        $data = $request->validate([
            'status' => ['required', 'in:pending,resolved'],
            'dm_notes' => ['nullable', 'string', 'max:4000'],
        ]);

        $action->update($data);

        return back();
    }

    /** DM (or the author) can delete. */
    public function destroy(Request $request, PlayerAction $action): RedirectResponse
    {
        $isDm = $action->scene->campaign->dm_user_id === $request->user()->id;
        $isAuthor = $action->user_id === $request->user()->id;
        if (! $isDm && ! $isAuthor) {
            throw new AuthorizationException();
        }

        $action->delete();

        return back();
    }
}
