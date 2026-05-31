<?php

namespace Database\Factories;

use App\Models\Campaign;
use App\Models\Location;
use App\Models\Scene;
use Illuminate\Database\Eloquent\Factories\Factory;

class SceneFactory extends Factory
{
    public function definition(): array
    {
        return [
            'campaign_id' => Campaign::factory(),
            'location_id' => Location::factory(),
            'title' => fake()->sentence(4),
            'summary' => fake()->sentence(),
            'status' => Scene::STATUS_DRAFT,
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => Scene::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);
    }
}
