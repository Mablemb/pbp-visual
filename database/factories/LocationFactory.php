<?php

namespace Database\Factories;

use App\Models\Campaign;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory(),
            'name' => fake()->randomElement(['The Prancing Pony', 'Whispering Forest', 'Stoneheart Keep', 'Sunken Crypt']),
            'description' => fake()->paragraph(),
            'background_path' => null,
        ];
    }
}
