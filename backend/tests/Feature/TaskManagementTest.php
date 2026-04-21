<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Enums\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->project = Project::factory()->create(['owner_id' => $this->owner->id]);
    $this->project->members()->create(['user_id' => $this->owner->id, 'role' => ProjectRole::Owner]);

    $this->board = Board::factory()->create(['project_id' => $this->project->id]);
    $this->column = Column::factory()->create(['board_id' => $this->board->id]);
});

it('can create a task', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
        'title' => 'New Task',
        'column_id' => $this->column->id,
        'description' => 'Task description',
        'type' => 'feature',
        'priority' => 'high',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'New Task')
        ->assertJsonPath('data.position', 0); // first task in column

    $this->assertDatabaseHas('tasks', [
        'title' => 'New Task',
        'column_id' => $this->column->id,
        'position' => 0,
        'project_id' => $this->project->id,
    ]);
});

it('can fetch task details', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'column_id' => $this->column->id,
        'title' => 'Sample Task'
    ]);

    $response = $this->actingAs($this->owner)->getJson("/api/v1/tasks/{$task->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.title', 'Sample Task');
});

it('can update a task', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'column_id' => $this->column->id,
        'title' => 'Old Title'
    ]);

    $response = $this->actingAs($this->owner)->putJson("/api/v1/tasks/{$task->id}", [
        'title' => 'New Title',
        'column_id' => $this->column->id,
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.title', 'New Title');
});

it('can move a task within the same column', function () {
    $task1 = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 0]);
    $task2 = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 1]);
    $task3 = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 2]);

    // Move task1 to position 2
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task1->id}/move", [
        'column_id' => $this->column->id,
        'position' => 2,
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('tasks', ['id' => $task1->id, 'position' => 2]);
    $this->assertDatabaseHas('tasks', ['id' => $task2->id, 'position' => 0]); // shifted up
    $this->assertDatabaseHas('tasks', ['id' => $task3->id, 'position' => 1]); // shifted up
});

it('can move a task to a different column', function () {
    $newColumn = Column::factory()->create(['board_id' => $this->board->id]);

    $task1 = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 0]);
    $task2 = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 1]);

    // Existing task in new column
    $task3 = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $newColumn->id, 'position' => 0]);

    // Move task1 to new column at position 0
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task1->id}/move", [
        'column_id' => $newColumn->id,
        'position' => 0,
    ]);

    $response->assertStatus(200);

    // Old column shifted
    $this->assertDatabaseHas('tasks', ['id' => $task2->id, 'position' => 0]);

    // New column shifted
    $this->assertDatabaseHas('tasks', ['id' => $task1->id, 'column_id' => $newColumn->id, 'position' => 0]);
    $this->assertDatabaseHas('tasks', ['id' => $task3->id, 'column_id' => $newColumn->id, 'position' => 1]);
});

it('can assign and unassign a user to a task', function () {
    $member = User::factory()->create();
    $this->project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]);

    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    // Assign
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task->id}/assign", [
        'user_id' => $member->id,
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('task_assignments', [
        'task_id' => $task->id,
        'user_id' => $member->id,
    ]);

    // Unassign
    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/tasks/{$task->id}/assign/{$member->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('task_assignments', [
        'task_id' => $task->id,
        'user_id' => $member->id,
    ]);
});

it('can delete a task', function () {
    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/tasks/{$task->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
});

it('can attach and detach a label to a task', function () {
    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);
    $label = \App\Models\Label::factory()->create(['project_id' => $this->project->id]);

    // Attach
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task->id}/labels", [
        'label_id' => $label->id,
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('task_labels', [
        'task_id' => $task->id,
        'label_id' => $label->id,
    ]);

    // Detach
    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/tasks/{$task->id}/labels/{$label->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('task_labels', [
        'task_id' => $task->id,
        'label_id' => $label->id,
    ]);
});

// --- EDGE CASES ---

it('fails to create task in a column from another project', function () {
    $otherProject = Project::factory()->create();
    $otherBoard = Board::factory()->create(['project_id' => $otherProject->id]);
    $otherColumn = Column::factory()->create(['board_id' => $otherBoard->id]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
        'title' => 'Hacked Task',
        'column_id' => $otherColumn->id,
    ]);

    $response->assertStatus(404); // Column not found within this project
});

it('prevents updating a task you dont have access to', function () {
    $outsider = User::factory()->create();
    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    $response = $this->actingAs($outsider)->putJson("/api/v1/tasks/{$task->id}", [
        'title' => 'Hacked Title',
        'column_id' => $this->column->id,
    ]);

    $response->assertStatus(403);
});

it('prevents a normal member from deleting a task they did not create', function () {
    $member = User::factory()->create();
    $this->project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]);

    // Task created by owner
    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'reporter_id' => $this->owner->id]);

    $response = $this->actingAs($member)->deleteJson("/api/v1/tasks/{$task->id}");

    $response->assertStatus(403);
});

it('fails to move task to a column from a different project', function () {
    $otherProject = Project::factory()->create();
    $otherBoard = Board::factory()->create(['project_id' => $otherProject->id]);
    $otherColumn = Column::factory()->create(['board_id' => $otherBoard->id]);

    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 0]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task->id}/move", [
        'column_id' => $otherColumn->id,
        'position' => 0,
    ]);

    $response->assertStatus(400); // BadRequestHttpException
});

it('fails to assign a user who is not a member of the project', function () {
    $outsider = User::factory()->create();
    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task->id}/assign", [
        'user_id' => $outsider->id,
    ]);

    $response->assertStatus(400); // BadRequestHttpException
});

it('fails to attach a label from a different project', function () {
    $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    // Label from another project
    $otherProject = Project::factory()->create();
    $label = \App\Models\Label::factory()->create(['project_id' => $otherProject->id]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$task->id}/labels", [
        'label_id' => $label->id,
    ]);

    $response->assertStatus(400); // BadRequestHttpException
});

it('prevents creating a task if column WIP limit is reached', function () {
    $this->column->update(['wip_limit' => 1]);

    // First task
    Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    // Second task should fail
    $response = $this->actingAs($this->owner)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
        'title' => 'Excess Task',
        'column_id' => $this->column->id,
    ]);

    $response->assertStatus(400)
        ->assertJsonFragment(['message' => "Cannot create task. Column '{$this->column->name}' has reached its WIP limit of 1."]);
});

it('prevents moving a task if destination column WIP limit is reached', function () {
    $newColumn = Column::factory()->create(['board_id' => $this->board->id, 'wip_limit' => 1]);

    // Existing task in new column (reaches limit)
    Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $newColumn->id]);

    // Task in old column
    $taskToMove = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$taskToMove->id}/move", [
        'column_id' => $newColumn->id,
        'position' => 0,
    ]);

    $response->assertStatus(400)
        ->assertJsonFragment(['message' => "Cannot move task. Column '{$newColumn->name}' has reached its WIP limit of 1."]);
});
