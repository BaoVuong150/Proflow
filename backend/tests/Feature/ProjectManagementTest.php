<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\User;
use App\Enums\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('can create a project and auto-generates default board and columns', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/v1/projects', [
        'name' => 'New Awesome Project',
        'description' => 'A test project description',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'New Awesome Project')
        ->assertJsonPath('data.owner_id', $user->id);

    $projectId = $response->json('data.id');

    // Verify owner was added to project_members
    $this->assertDatabaseHas('project_members', [
        'project_id' => $projectId,
        'user_id' => $user->id,
        'role' => ProjectRole::Owner->value,
    ]);

    // Verify default board exists
    $this->assertDatabaseHas('boards', [
        'project_id' => $projectId,
        'name' => 'Main Board',
    ]);

    $board = Board::where('project_id', $projectId)->first();

    // Verify 4 default columns exist
    $this->assertDatabaseCount('columns', 4);
    $this->assertDatabaseHas('columns', [
        'board_id' => $board->id,
        'name' => 'To Do',
    ]);
});

it('can list projects for a user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    // Project owned by user
    $project1 = Project::factory()->create(['owner_id' => $user->id]);
    $project1->members()->create(['user_id' => $user->id, 'role' => ProjectRole::Owner]);

    // Project where user is just a member
    $project2 = Project::factory()->create(['owner_id' => $otherUser->id]);
    $project2->members()->create(['user_id' => $otherUser->id, 'role' => ProjectRole::Owner]);
    $project2->members()->create(['user_id' => $user->id, 'role' => ProjectRole::Member]);

    // Project completely unrelated
    $project3 = Project::factory()->create(['owner_id' => $otherUser->id]);
    $project3->members()->create(['user_id' => $otherUser->id, 'role' => ProjectRole::Owner]);

    $response = $this->actingAs($user)->getJson('/api/v1/projects');

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data'); // Should see project 1 and 2, but not 3
});

it('allows owners to add members to a project', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);

    $response = $this->actingAs($owner)->postJson("/api/v1/projects/{$project->id}/members", [
        'email' => $member->email,
        'role' => 'member',
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('project_members', [
        'project_id' => $project->id,
        'user_id' => $member->id,
        'role' => 'member',
    ]);
});

it('prevents regular members from adding other members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $newGuy = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]); // Just a member

    $response = $this->actingAs($member)->postJson("/api/v1/projects/{$project->id}/members", [
        'email' => $newGuy->email,
    ]);

    $response->assertStatus(403); // Forbidden
});

it('allows owners to remove members but not themselves', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]);

    // Owner removing member
    $this->actingAs($owner)->deleteJson("/api/v1/projects/{$project->id}/members/{$member->id}")
        ->assertStatus(200);

    $this->assertDatabaseMissing('project_members', [
        'project_id' => $project->id,
        'user_id' => $member->id,
    ]);

    // Owner removing themselves
    $this->actingAs($owner)->deleteJson("/api/v1/projects/{$project->id}/members/{$owner->id}")
        ->assertStatus(403); // Access denied
});

// --- EDGE CASES ---

it('fails to create project without a name', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/v1/projects', [
        'description' => 'Missing name',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

it('fails to add a non-existent user to project', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);

    $response = $this->actingAs($owner)->postJson("/api/v1/projects/{$project->id}/members", [
        'email' => 'ghost@example.com',
    ]);

    $response->assertStatus(404); // User not found
});

it('fails to add a user who is already a member', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]);

    // Try adding the member again
    $response = $this->actingAs($owner)->postJson("/api/v1/projects/{$project->id}/members", [
        'email' => $member->email,
    ]);

    $response->assertStatus(400); // Bad Request
});

it('prevents a user from viewing a project they are not a member of', function () {
    $owner = User::factory()->create();
    $outsider = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);

    $response = $this->actingAs($outsider)->getJson("/api/v1/projects/{$project->id}");

    $response->assertStatus(403); // Forbidden
});

it('prevents a regular member from updating project details', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id, 'name' => 'Old Name']);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]);

    $response = $this->actingAs($member)->putJson("/api/v1/projects/{$project->id}", [
        'name' => 'Hacked Name',
    ]);

    $response->assertStatus(403); // Forbidden
    $this->assertDatabaseHas('projects', ['id' => $project->id, 'name' => 'Old Name']);
});

it('prevents an admin from deleting the project', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $project->members()->create(['user_id' => $admin->id, 'role' => ProjectRole::Admin]);

    // Admin tries to delete the project entirely
    $response = $this->actingAs($admin)->deleteJson("/api/v1/projects/{$project->id}");

    $response->assertStatus(403); // Forbidden
    $this->assertDatabaseHas('projects', ['id' => $project->id]);
});

it('removes user from all task assignments when removed from project', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $project = Project::factory()->create(['owner_id' => $owner->id]);
    $project->members()->create(['user_id' => $owner->id, 'role' => ProjectRole::Owner]);
    $project->members()->create(['user_id' => $member->id, 'role' => ProjectRole::Member]);

    $board = Board::factory()->create(['project_id' => $project->id]);
    $column = Column::factory()->create(['board_id' => $board->id]);

    $task = \App\Models\Task::factory()->create([
        'project_id' => $project->id,
        'column_id' => $column->id,
        'reporter_id' => $owner->id,
    ]);

    // Assign member to task
    $task->assignees()->attach($member->id, ['assigned_by' => $owner->id]);

    $this->assertDatabaseHas('task_assignments', [
        'task_id' => $task->id,
        'user_id' => $member->id,
    ]);

    // Remove member from project
    $this->actingAs($owner)->deleteJson("/api/v1/projects/{$project->id}/members/{$member->id}")
        ->assertStatus(200);

    // Verify member is removed from task_assignments
    $this->assertDatabaseMissing('task_assignments', [
        'task_id' => $task->id,
        'user_id' => $member->id,
    ]);
});
