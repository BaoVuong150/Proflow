<?php

namespace Database\Factories;

use App\Models\Column;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'column_id' => Column::factory(),
            'reporter_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'position' => fake()->numberBetween(0, 10),
            'type' => fake()->randomElement(['task', 'bug', 'feature']),
            'status' => fake()->randomElement(['open', 'in_progress', 'done']),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
        ];
    }
}
