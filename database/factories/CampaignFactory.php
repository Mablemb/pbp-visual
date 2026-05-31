<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CampaignFactory extends Factory
{
    public function definition(): array
    {
        return [
            'dm_user_id' => User::factory(),
            'name' => fake()->catchPhrase(),
            'synopsis' => fake()->paragraph(),
        ];
    }
}
