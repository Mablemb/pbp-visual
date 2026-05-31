<?php

namespace Database\Factories;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CampaignMemberFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory(),
            'user_id' => User::factory(),
        ];
    }
}
