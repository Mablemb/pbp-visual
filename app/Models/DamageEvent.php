<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DamageEvent extends Model
{
    use HasFactory;

    public const TYPES = [
        'bludgeoning',
        'slashing',
        'piercing',
        'acid',
        'lightning',
        'cold',
        'fire',
        'force',
        'necrotic',
        'psychic',
        'radiant',
        'thunder',
        'poison',
    ];

    protected $fillable = [
        'scene_line_id',
        'character_id',
        'npc_id',
        'amount',
        'damage_type',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function sceneLine(): BelongsTo
    {
        return $this->belongsTo(SceneLine::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }

    public function npc(): BelongsTo
    {
        return $this->belongsTo(Npc::class);
    }
}
