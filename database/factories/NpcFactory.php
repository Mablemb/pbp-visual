<?php

namespace Database\Factories;

use App\Models\Campaign;
use Illuminate\Database\Eloquent\Factories\Factory;

class NpcFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory(),
            'name' => fake()->firstName().' '.fake()->lastName(),
            'role' => fake()->randomElement(['Innkeeper', 'Blacksmith', 'Mayor', 'Mysterious Stranger', 'Merchant']),
            'description' => fake()->sentence(),
        ];
    }
}
