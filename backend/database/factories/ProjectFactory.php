<?php

namespace Database\Factories;

use App\Enums\ProjectVisibility;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->catchPhrase(),
            'description' => fake()->paragraph(),
            'owner_id' => User::factory(),
            'visibility' => fake()->randomElement(array_column(ProjectVisibility::cases(), 'value')),
            'color' => fake()->hexColor(),
            'icon' => 'folder',
            'is_archived' => false,
        ];
    }
}
