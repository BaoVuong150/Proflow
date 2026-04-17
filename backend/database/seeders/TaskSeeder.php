<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $project = Project::first();
        if (! $project) {
            return;
        }

        // Create Default Board
        $board = Board::create([
            'project_id' => $project->id,
            'name' => 'Main Board',
            'is_default' => true,
        ]);

        // Create Columns
        $columns = [
            ['name' => 'To Do', 'position' => 0, 'color' => '#64748b'],
            ['name' => 'In Progress', 'position' => 1, 'color' => '#3b82f6'],
            ['name' => 'Review', 'position' => 2, 'color' => '#f59e0b'],
            ['name' => 'Done', 'position' => 3, 'color' => '#22c55e', 'is_done_column' => true],
        ];

        foreach ($columns as $colData) {
            $colData['board_id'] = $board->id;
            Column::create($colData);
        }

        $todoColumn = Column::where('name', 'To Do')->first();
        $inProgressColumn = Column::where('name', 'In Progress')->first();

        $admin = $project->members()->first()->user;

        // Create Tasks
        Task::factory(3)->create([
            'project_id' => $project->id,
            'column_id' => $todoColumn->id,
            'reporter_id' => $admin->id,
        ]);

        Task::factory(2)->create([
            'project_id' => $project->id,
            'column_id' => $inProgressColumn->id,
            'reporter_id' => $admin->id,
        ]);
    }
}
