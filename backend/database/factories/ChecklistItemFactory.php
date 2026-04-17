<?php

namespace Database\Factories;

use App\Models\Checklist;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChecklistItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'checklist_id' => Checklist::factory(),
            'content' => fake()->sentence(),
            'is_completed' => false,
            'position' => fake()->numberBetween(0, 5),
        ];
    }
}
