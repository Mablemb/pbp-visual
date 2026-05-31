<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A "scene" is a visual-novel-style segment of the story: a background
 * (Location) plus an ordered sequence of dialogue/narration lines.
 *
 * Players see only published scenes; the DM works on drafts.
 */
class Scene extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'campaign_id', 'location_id', 'title', 'summary', 'status', 'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(SceneLine::class)->orderBy('position');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(PlayerAction::class);
    }

    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }
}
