<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quest extends Model
{
    use HasFactory;

    public const STATUSES = ['active', 'completed', 'failed'];

    protected $fillable = ['campaign_id', 'title', 'description', 'status'];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
