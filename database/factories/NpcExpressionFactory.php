<?php

namespace Database\Factories;

use App\Models\Npc;
use Illuminate\Database\Eloquent\Factories\Factory;

class NpcExpressionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'npc_id' => Npc::factory(),
            'label' => fake()->randomElement(['neutral', 'feliz', 'raivoso', 'triste', 'surpreso']),
            'sprite_path' => 'sprites/placeholder.png',
            'is_default' => false,
        ];
    }
}
