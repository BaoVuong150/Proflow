<?php

namespace Database\Seeders;

use App\Enums\ProjectRole;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $admin = User::where('email', 'admin@proflow.test')->first() ?? $users->first();

        // Create Demo Project
        $project = Project::factory()->create([
            'name' => 'ProFlow Development',
            'owner_id' => $admin->id,
        ]);

        // Add admin as owner in project_members
        $project->members()->create([
            'user_id' => $admin->id,
            'role' => ProjectRole::Owner,
        ]);

        // Add 5 random members
        $randomUsers = $users->where('id', '!=', $admin->id)->random(5);
        foreach ($randomUsers as $user) {
            $project->members()->create([
                'user_id' => $user->id,
                'role' => ProjectRole::Member,
            ]);
        }
    }
}
