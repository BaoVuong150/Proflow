<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\User;
use App\Enums\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('can fetch boards for a project', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    
    $board1 = Board::factory()->create(['project_id' => $project->id, 'name' => 'Board 1']);
    $board2 = Board::factory()->create(['project_id' => $project->id, 'name' => 'Board 2']);

    $response = $this->actingAs($owner)->getJson("/api/v1/projects/{$project->id}/boards");

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data');
});

it('can fetch a single board with ordered columns', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    
    $board = Board::factory()->create(['project_id' => $project->id]);
    
    Column::factory()->create(['board_id' => $board->id, 'position' => 2, 'name' => 'Col 2']);
    Column::factory()->create(['board_id' => $board->id, 'position' => 0, 'name' => 'Col 0']);
    Column::factory()->create(['board_id' => $board->id, 'position' => 1, 'name' => 'Col 1']);

    $response = $this->actingAs($owner)->getJson("/api/v1/boards/{$board->id}");

    $response->assertStatus(200)
        ->assertJsonCount(3, 'data.columns')
        ->assertJsonPath('data.columns.0.name', 'Col 0')
        ->assertJsonPath('data.columns.1.name', 'Col 1')
        ->assertJsonPath('data.columns.2.name', 'Col 2');
});

it('can create a new column', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    
    // Existing column at position 0
    Column::factory()->create(['board_id' => $board->id, 'position' => 0]);

    $response = $this->actingAs($owner)->postJson("/api/v1/boards/{$board->id}/columns", [
        'name' => 'New Column',
        'color' => '#ff0000',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'New Column')
        ->assertJsonPath('data.position', 1); // Should be max + 1
        
    $this->assertDatabaseHas('columns', [
        'board_id' => $board->id,
        'name' => 'New Column',
        'position' => 1,
    ]);
});

it('can update a column', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    $column = Column::factory()->create(['board_id' => $board->id, 'name' => 'Old Name']);

    $response = $this->actingAs($owner)->putJson("/api/v1/columns/{$column->id}", [
        'name' => 'Updated Name',
        'color' => '#00ff00',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.name', 'Updated Name');
});

it('can delete a column', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    $column = Column::factory()->create(['board_id' => $board->id]);

    $this->actingAs($owner)->deleteJson("/api/v1/columns/{$column->id}")
        ->assertStatus(200);

    $this->assertDatabaseMissing('columns', ['id' => $column->id]);
});

it('can reorder columns', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    
    $col1 = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);
    $col2 = Column::factory()->create(['board_id' => $board->id, 'position' => 1]);
    $col3 = Column::factory()->create(['board_id' => $board->id, 'position' => 2]);

    $response = $this->actingAs($owner)->putJson("/api/v1/boards/{$board->id}/columns/reorder", [
        'columns' => [
            ['id' => $col3->id, 'position' => 0],
            ['id' => $col1->id, 'position' => 1],
            ['id' => $col2->id, 'position' => 2],
        ]
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('columns', ['id' => $col3->id, 'position' => 0]);
    $this->assertDatabaseHas('columns', ['id' => $col1->id, 'position' => 1]);
    $this->assertDatabaseHas('columns', ['id' => $col2->id, 'position' => 2]);
});

// --- EDGE CASES ---

it('fails to create a column with missing name', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($owner)->postJson("/api/v1/boards/{$board->id}/columns", [
        // completely missing name
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('prevents creating a column in a board you dont have access to', function () {
    $owner = User::factory()->create();
    $outsider = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);

    $response = $this->actingAs($outsider)->postJson("/api/v1/boards/{$board->id}/columns", [
        'name' => 'Hacked Column',
    ]);

    $response->assertStatus(403);
});

it('prevents reordering columns in someone elses board', function () {
    $owner = User::factory()->create();
    $outsider = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    
    $col1 = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);

    $response = $this->actingAs($outsider)->putJson("/api/v1/boards/{$board->id}/columns/reorder", [
        'columns' => [
            ['id' => $col1->id, 'position' => 99],
        ]
    ]);

    $response->assertStatus(403);
});

it('fails to reorder columns with invalid payload structure', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    
    $col1 = Column::factory()->create(['board_id' => $board->id, 'position' => 0]);

    $response = $this->actingAs($owner)->putJson("/api/v1/boards/{$board->id}/columns/reorder", [
        'columns' => [
            ['id' => $col1->id], // Missing position
            ['position' => 1], // Missing ID
        ]
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['columns.0.position', 'columns.1.id']);
});

it('prevents deleting a column in someone elses board', function () {
    $owner = User::factory()->create();
    $outsider = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    $column = Column::factory()->create(['board_id' => $board->id]);

    $response = $this->actingAs($outsider)->deleteJson("/api/v1/columns/{$column->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('columns', ['id' => $column->id]);
});

it('prevents deleting a column that contains tasks', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $board = Board::factory()->create(['project_id' => $project->id]);
    $column = Column::factory()->create(['board_id' => $board->id]);
    
    // Add a task to the column
    \App\Models\Task::factory()->create([
        'project_id' => $project->id,
        'column_id' => $column->id,
        'reporter_id' => $owner->id,
    ]);

    $response = $this->actingAs($owner)->deleteJson("/api/v1/columns/{$column->id}");

    $response->assertStatus(400)
        ->assertJsonFragment(['message' => 'Cannot delete a column that contains tasks. Please move or delete the tasks first.']);
        
    $this->assertDatabaseHas('columns', ['id' => $column->id]);
});
