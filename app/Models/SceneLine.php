<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One ordered line inside a scene. Either narration (no speaker) or an NPC
 * speaking with a chosen expression sprite.
 */
class SceneLine extends Model
{
    use HasFactory;

    public const KIND_NARRATION = 'narration';
    public const KIND_NPC = 'npc';
    public const KIND_PLAYER = 'player';

    public const PLAYER_ACTION = 'action';
    public const PLAYER_DIALOGUE = 'dialogue';

    protected $fillable = [
        'scene_id', 'position', 'kind', 'npc_id', 'npc_expression_id',
        'character_id', 'player_kind', 'character_expression_id',
        'player_action_id', 'body',
    ];

    protected $casts = [
        'position' => 'integer',
    ];

    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    public function npc(): BelongsTo
    {
        return $this->belongsTo(Npc::class);
    }

    public function expression(): BelongsTo
    {
        return $this->belongsTo(NpcExpression::class, 'npc_expression_id');
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }

    public function characterExpression(): BelongsTo
    {
        return $this->belongsTo(CharacterExpression::class);
    }

    public function playerAction(): BelongsTo
    {
        return $this->belongsTo(PlayerAction::class);
    }
}
