<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NpcExpression extends Model
{
    use HasFactory;

    /** Allowed expression labels (PT-BR). Free-form fallback also possible. */
    public const LABELS = [
        'neutral', 'feliz', 'raivoso', 'triste', 'surpreso', 'com_medo', 'pensativo',
    ];

    protected $fillable = ['npc_id', 'label', 'sprite_path', 'is_default'];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function npc(): BelongsTo
    {
        return $this->belongsTo(Npc::class);
    }
}
