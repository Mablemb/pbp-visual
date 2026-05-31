<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampaignMember extends Model
{
    use HasFactory;

    protected $fillable = ['campaign_id', 'user_id'];
}
