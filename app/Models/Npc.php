<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Npc extends Model
{
    use HasFactory;

    protected $fillable = ['campaign_id', 'name', 'role', 'description'];

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
