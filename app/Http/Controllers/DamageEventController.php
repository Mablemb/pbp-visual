<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\DamageEvent;
use App\Models\Npc;
use App\Models\SceneLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Records a damage event tied to a scene line, and as a side effect
 * decrements the target's current HP. Deleting restores it.
 * Target can be either a Character (player) or an Npc.
 */
class DamageEventController extends Controller
{
    public function store(Request $request, SceneLine $line): RedirectResponse
    {
        $this->authorize('manage', $line->scene->campaign);

        $data = $request->validate([
            'target_kind' => ['required', Rule::in(['character', 'npc'])],
            'target_id' => ['required', 'integer'],
            'amount' => ['required', 'integer', 'min:1', 'max:999'],
            'damage_type' => ['required', Rule::in(DamageEvent::TYPES)],
        ]);

        $target = $data['target_kind'] === 'character'
            ? Character::findOrFail($data['target_id'])
            : Npc::findOrFail($data['target_id']);

        abort_unless($target->campaign_id === $line->scene->campaign_id, 422);

        DB::transaction(function () use ($line, $data, $target) {
            $line->damageEvents()->create([
                'character_id' => $data['target_kind'] === 'character' ? $target->id : null,
                'npc_id' => $data['target_kind'] === 'npc' ? $target->id : null,
                'amount' => $data['amount'],
                'damage_type' => $data['damage_type'],
            ]);
            $target->hp_current = max(0, ($target->hp_current ?? 0) - $data['amount']);
            $target->save();
        });

        return back();
    }

    public function destroy(DamageEvent $damage): RedirectResponse
    {
        $line = $damage->sceneLine;
        $this->authorize('manage', $line->scene->campaign);

        DB::transaction(function () use ($damage) {
            $target = $damage->character ?? $damage->npc;
            if ($target) {
                $target->hp_current = min(
                    $target->hp_max,
                    $target->hp_current + $damage->amount,
                );
                $target->save();
            }
            $damage->delete();
        });

        return back();
    }
}
