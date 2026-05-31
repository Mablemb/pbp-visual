<?php

namespace Database\Factories;

use App\Models\Scene;
use App\Models\SceneLine;
use Illuminate\Database\Eloquent\Factories\Factory;

class SceneLineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'scene_id' => Scene::factory(),
            'position' => 1,
            'kind' => SceneLine::KIND_NARRATION,
            'npc_id' => null,
            'npc_expression_id' => null,
            'body' => fake()->sentence(),
        ];
    }
}
