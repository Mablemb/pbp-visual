<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A Player Character. Owned by one player (user) inside a campaign.
 */
class Character extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id', 'user_id', 'name', 'race', 'class', 'level',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expressions(): HasMany
    {
        return $this->hasMany(CharacterExpression::class);
    }
}
