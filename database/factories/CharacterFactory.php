<?php

namespace Database\Factories;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CharacterFactory extends Factory
{
    public function definition(): array
    {
        $hp = fake()->numberBetween(10, 50);

        return [
            'campaign_id' => Campaign::factory(),
            'user_id' => User::factory(),
            'name' => fake()->firstName().' '.fake()->lastName(),
            'race' => fake()->randomElement(['Human', 'Elf', 'Dwarf', 'Halfling', 'Tiefling']),
            'class' => fake()->randomElement(['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Bard']),
            'level' => fake()->numberBetween(1, 10),
            'hp_max' => $hp,
            'hp_current' => $hp,
            'strength' => fake()->numberBetween(8, 18),
            'dexterity' => fake()->numberBetween(8, 18),
            'constitution' => fake()->numberBetween(8, 18),
            'intelligence' => fake()->numberBetween(8, 18),
            'wisdom' => fake()->numberBetween(8, 18),
            'charisma' => fake()->numberBetween(8, 18),
            'bio' => fake()->paragraph(),
            'portrait_path' => null,
        ];
    }
}
