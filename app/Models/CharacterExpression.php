<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CharacterExpression extends Model
{
    use HasFactory;

    protected $fillable = ['character_id', 'label', 'sprite_path', 'is_default'];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }
}
