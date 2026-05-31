<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A free-text reaction a player posts after reading a scene. The DM later
 * marks it as resolved (optionally with notes about how it played out).
 */
class PlayerAction extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_RESOLVED = 'resolved';

    public const KIND_ACTION = 'action';
    public const KIND_DIALOGUE = 'dialogue';

    protected $fillable = [
        'scene_id', 'user_id', 'character_id', 'kind', 'character_expression_id',
        'body', 'status', 'dm_notes',
    ];

    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }

    public function characterExpression(): BelongsTo
    {
        return $this->belongsTo(CharacterExpression::class);
    }

    public function sceneLine(): HasOne
    {
        return $this->hasOne(SceneLine::class);
    }
}
