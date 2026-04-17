<?php

use App\Enums\ProjectRole;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('creates a user and project correctly', function () {
    $user = User::factory()->create();

    $project = Project::factory()->create([
        'owner_id' => $user->id,
        'name' => 'Test Project',
    ]);

    expect($project->name)->toBe('Test Project')
        ->and($project->owner->id)->toBe($user->id);
});

it('tests project roles and members relationships', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);

    $project->members()->create([
        'user_id' => $owner->id,
        'role' => ProjectRole::Owner,
    ]);

    $project->members()->create([
        'user_id' => $member->id,
        'role' => ProjectRole::Member,
    ]);

    expect($project->members)->toHaveCount(2)
        ->and($project->members->first()->role)->toBe(ProjectRole::Owner)
        ->and($project->members->last()->role)->toBe(ProjectRole::Member);
});

it('tests board, column, and task deep relationships', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $user->id]);

    $board = Board::create([
        'project_id' => $project->id,
        'name' => 'Main Board',
    ]);

    $column = Column::create([
        'board_id' => $board->id,
        'name' => 'To Do',
    ]);

    $task = Task::factory()->create([
        'column_id' => $column->id,
        'project_id' => $project->id,
        'reporter_id' => $user->id,
        'title' => 'Implement Auth',
    ]);

    // Verify cascade relationships
    $fetchedBoard = Board::with('columns.tasks')->first();

    expect($fetchedBoard->columns)->toHaveCount(1)
        ->and($fetchedBoard->columns->first()->tasks)->toHaveCount(1)
        ->and($fetchedBoard->columns->first()->tasks->first()->title)->toBe('Implement Auth');
});

it('casts enums correctly on task model', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $user->id]);
    $board = Board::create(['project_id' => $project->id, 'name' => 'Main Board']);
    $column = Column::create(['board_id' => $board->id, 'name' => 'To Do']);

    $task = Task::factory()->create([
        'column_id' => $column->id,
        'project_id' => $project->id,
        'reporter_id' => $user->id,
        'priority' => TaskPriority::Urgent->value,
        'status' => TaskStatus::InProgress->value,
    ]);

    // Refresh from db
    $task->refresh();

    // The attributes should be instances of the Enum
    expect($task->priority)->toBeInstanceOf(TaskPriority::class)
        ->and($task->priority)->toBe(TaskPriority::Urgent)
        ->and($task->status)->toBeInstanceOf(TaskStatus::class)
        ->and($task->status)->toBe(TaskStatus::InProgress);
});
