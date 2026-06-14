<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A tabletop campaign. Owned by one DM and played by zero+ players.
 */
class Campaign extends Model
{
    use HasFactory;

    protected $fillable = ['dm_user_id', 'name', 'synopsis'];

    public function dm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dm_user_id');
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'campaign_members')->withTimestamps();
    }

    public function characters(): HasMany
    {
        return $this->hasMany(Character::class);
    }

    public function npcs(): HasMany
    {
        return $this->hasMany(Npc::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function quests(): HasMany
    {
        return $this->hasMany(Quest::class);
    }

    public function scenes(): HasMany
    {
        return $this->hasMany(Scene::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(CampaignImage::class);
    }

    /** True if the user is the DM or a member of this campaign. */
    public function isAccessibleBy(User $user): bool
    {
        return $this->dm_user_id === $user->id
            || $this->players()->whereKey($user->id)->exists();
    }
}
