<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaginationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Project list is paginated at 20 per page.
     */
    public function test_project_list_paginated(): void
    {
        $user = User::factory()->create();

        // Create 25 projects (should produce 2 pages)
        for ($i = 1; $i <= 25; $i++) {
            $project = Project::create(['name' => "Project {$i}", 'owner_id' => $user->id]);
            $project->members()->create(['user_id' => $user->id, 'role' => 'owner']);
        }

        // Page 1: should return 20 projects
        $response = $this->actingAs($user)->getJson('/api/v1/projects?page=1');
        $response->assertStatus(200);
        $response->assertJsonPath('meta.current_page', 1);
        $response->assertJsonPath('meta.per_page', 20);
        $response->assertJsonPath('meta.total', 25);
        $this->assertCount(20, $response->json('data'));

        // Page 2: should return 5 projects
        $response = $this->actingAs($user)->getJson('/api/v1/projects?page=2');
        $response->assertStatus(200);
        $response->assertJsonPath('meta.current_page', 2);
        $this->assertCount(5, $response->json('data'));
    }

    /**
     * Test: Comment list is paginated at 10 per page.
     */
    public function test_comment_list_paginated(): void
    {
        $user = User::factory()->create();

        $project = Project::create(['name' => 'Test', 'owner_id' => $user->id]);
        $project->members()->create(['user_id' => $user->id, 'role' => 'owner']);
        $board = $project->boards()->create(['name' => 'Board']);
        $column = $board->columns()->create(['name' => 'Col', 'position' => 0]);
        $task = $column->tasks()->create([
            'title' => 'Task',
            'project_id' => $project->id,
            'creator_id' => $user->id,
            'reporter_id' => $user->id,
            'position' => 0,
        ]);

        // Create 15 comments
        for ($i = 1; $i <= 15; $i++) {
            $task->comments()->create([
                'user_id' => $user->id,
                'content' => "Comment {$i}",
            ]);
        }

        // Page 1: should return 10 comments
        $response = $this->actingAs($user)->getJson("/api/v1/tasks/{$task->id}/comments?page=1");
        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));

        // Page 2: should return 5 comments
        $response = $this->actingAs($user)->getJson("/api/v1/tasks/{$task->id}/comments?page=2");
        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
    }

    /**
     * Test: Attachment list is paginated at 10 per page.
     */
    public function test_attachment_list_paginated(): void
    {
        $user = User::factory()->create();

        $project = Project::create(['name' => 'Test', 'owner_id' => $user->id]);
        $project->members()->create(['user_id' => $user->id, 'role' => 'owner']);
        $board = $project->boards()->create(['name' => 'Board']);
        $column = $board->columns()->create(['name' => 'Col', 'position' => 0]);
        $task = $column->tasks()->create([
            'title' => 'Task',
            'project_id' => $project->id,
            'creator_id' => $user->id,
            'reporter_id' => $user->id,
            'position' => 0,
        ]);

        // Create 15 attachments directly in DB (no actual file upload)
        for ($i = 1; $i <= 15; $i++) {
            $task->attachments()->create([
                'user_id' => $user->id,
                'original_name' => "file_{$i}.pdf",
                'file_path' => "https://res.cloudinary.com/test/file_{$i}.pdf",
                'file_size' => 1024,
                'mime_type' => 'application/pdf',
            ]);
        }

        // Page 1: should return 10 attachments
        $response = $this->actingAs($user)->getJson("/api/v1/tasks/{$task->id}/attachments?page=1");
        $response->assertStatus(200);
        $this->assertCount(10, $response->json('data'));

        // Page 2: should return 5 attachments
        $response = $this->actingAs($user)->getJson("/api/v1/tasks/{$task->id}/attachments?page=2");
        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
    }
}
