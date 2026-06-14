<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Catalog of every image stored for a campaign, used to power the reuse
 * gallery and to track which files exist (so the same file can be referenced
 * by multiple records without being uploaded twice).
 */
class CampaignImage extends Model
{
    use HasFactory;

    protected $fillable = ['campaign_id', 'user_id', 'category', 'path', 'label'];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    /** The user who uploaded/generated this image. */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
