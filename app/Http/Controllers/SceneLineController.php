<?php

namespace App\Http\Controllers;

use App\Models\PlayerAction;
use App\Models\Scene;
use App\Models\SceneLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Manages the ordered lines inside a scene: add, edit, delete, reorder.
 * All routes nested under /scenes/{scene}/lines.
 */
class SceneLineController extends Controller
{
    public function store(Request $request, Scene $scene): RedirectResponse
    {
        $this->authorize('manage', $scene->campaign);

        $data = $this->validated($request, $scene);

        $data['position'] = ($scene->lines()->max('position') ?? 0) + 1;
        $scene->lines()->create($data);

        return back();
    }

    public function update(Request $request, SceneLine $line): RedirectResponse
    {
        $this->authorize('manage', $line->scene->campaign);

        $data = $this->validated($request, $line->scene);
        $line->update($data);

        return back();
    }

    public function destroy(SceneLine $line): RedirectResponse
    {
        $this->authorize('manage', $line->scene->campaign);
        $line->delete();

        return back();
    }

    /**
     * Reorder all lines of a scene at once.
     * Expects: { order: [lineId1, lineId2, ...] }
     */
    public function reorder(Request $request, Scene $scene): RedirectResponse
    {
        $this->authorize('manage', $scene->campaign);

        $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer'],
        ]);

        $ids = $scene->lines()->pluck('id')->all();
        $incoming = array_values(array_intersect($request->input('order'), $ids));

        DB::transaction(function () use ($scene, $incoming) {
            // Temporarily shift positions to a high offset to avoid the
            // (scene_id, position) unique constraint during the swap.
            $offset = 100000;
            foreach ($incoming as $position => $id) {
                $scene->lines()->whereKey($id)->update(['position' => $offset + $position + 1]);
            }
            foreach ($incoming as $position => $id) {
                $scene->lines()->whereKey($id)->update(['position' => $position + 1]);
            }
        });

        return back();
    }

    private function validated(Request $request, Scene $scene): array
    {
        $data = $request->validate([
            'kind' => ['required', 'in:narration,npc,player'],
            'body' => ['required', 'string', 'max:4000'],
            'npc_id' => ['nullable', 'integer', 'exists:npcs,id'],
            'npc_expression_id' => ['nullable', 'integer', 'exists:npc_expressions,id'],
            'character_id' => ['nullable', 'integer', 'exists:characters,id'],
            'character_expression_id' => ['nullable', 'integer', 'exists:character_expressions,id'],
            'player_kind' => ['nullable', 'in:action,dialogue'],
        ]);

        if ($data['kind'] !== SceneLine::KIND_NPC) {
            $data['npc_id'] = null;
            $data['npc_expression_id'] = null;
        }
        if ($data['kind'] !== SceneLine::KIND_PLAYER) {
            $data['character_id'] = null;
            $data['character_expression_id'] = null;
            $data['player_kind'] = null;
        }

        return $data;
    }

    /**
     * Import a player's pending action into the scene as a new line at the
     * end of the timeline, and mark the action as resolved.
     */
    public function importAction(Scene $scene, PlayerAction $action): RedirectResponse
    {
        $this->authorize('manage', $scene->campaign);

        abort_unless($action->scene_id === $scene->id, 404);

        DB::transaction(function () use ($scene, $action) {
            $scene->lines()->create([
                'position' => ($scene->lines()->max('position') ?? 0) + 1,
                'kind' => SceneLine::KIND_PLAYER,
                'character_id' => $action->character_id,
                'character_expression_id' => $action->character_expression_id,
                'player_kind' => $action->kind ?? PlayerAction::KIND_ACTION,
                'player_action_id' => $action->id,
                'body' => $action->body,
            ]);
            $action->update(['status' => PlayerAction::STATUS_RESOLVED]);
        });

        return back();
    }
}
