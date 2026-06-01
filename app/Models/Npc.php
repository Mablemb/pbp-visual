<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Npc extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id', 'name', 'role', 'description',
        'race', 'class', 'level',
        'hp_max', 'hp_current',
        'strength', 'dexterity', 'constitution',
        'intelligence', 'wisdom', 'charisma',
        'bio', 'portrait_path',
    ];

    protected $casts = [
        'level' => 'integer',
        'hp_max' => 'integer',
        'hp_current' => 'integer',
        'strength' => 'integer',
        'dexterity' => 'integer',
        'constitution' => 'integer',
        'intelligence' => 'integer',
        'wisdom' => 'integer',
        'charisma' => 'integer',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function expressions(): HasMany
    {
        return $this->hasMany(NpcExpression::class);
    }

    public function defaultExpression(): ?NpcExpression
    {
        return $this->expressions()->where('is_default', true)->first()
            ?? $this->expressions()->first();
    }
}
