<?php

namespace Database\Factories;

use App\Models\Campaign;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status' => 'active',
        ];
    }
}
