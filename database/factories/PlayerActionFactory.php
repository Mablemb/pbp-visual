<?php

namespace Database\Factories;

use App\Models\PlayerAction;
use App\Models\Scene;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlayerActionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'scene_id' => Scene::factory(),
            'user_id' => User::factory(),
            'character_id' => null,
            'body' => fake()->paragraph(),
            'status' => PlayerAction::STATUS_PENDING,
            'dm_notes' => null,
        ];
    }
}
