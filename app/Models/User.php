<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /** Campaigns where this user is the DM. */
    public function campaigns_as_dm(): HasMany
    {
        return $this->hasMany(Campaign::class, 'dm_user_id');
    }

    /** Campaigns where this user is an invited player. */
    public function campaigns_as_player(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class, 'campaign_members')->withTimestamps();
    }

    /** Player characters owned by this user (across all campaigns). */
    public function characters(): HasMany
    {
        return $this->hasMany(Character::class);
    }
}
