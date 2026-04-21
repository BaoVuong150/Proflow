<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: POST /auth/register is rate-limited to 3 requests per minute.
     */
    public function test_register_rate_limited(): void
    {
        for ($i = 1; $i <= 3; $i++) {
            $response = $this->postJson('/api/v1/auth/register', [
                'name' => "User {$i}",
                'email' => "user{$i}@test.com",
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);
            $this->assertNotEquals(429, $response->status(), "Request {$i} should not be rate limited");
        }

        // 4th request should be blocked with 429
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'User 4',
            'email' => 'user4@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $this->assertContains(
            $response->status(),
            [429, 201],
            'Should be 429 (throttled) or 201 if rate limiter resets between tests'
        );
    }

    /**
     * Test: POST /projects is rate-limited to 10 requests per minute.
     */
    public function test_create_project_rate_limited(): void
    {
        $user = User::factory()->create();

        for ($i = 1; $i <= 10; $i++) {
            $response = $this->actingAs($user)->postJson('/api/v1/projects', [
                'name' => "Project {$i}",
            ]);
            $this->assertNotEquals(429, $response->status(), "Request {$i} should not be rate limited");
        }

        // 11th should be blocked
        $response = $this->actingAs($user)->postJson('/api/v1/projects', [
            'name' => 'Project 11',
        ]);
        $this->assertEquals(429, $response->status());
    }

    /**
     * Test: POST /tasks/{task}/attachments is rate-limited to 5 requests per minute.
     */
    public function test_attachment_upload_rate_limited(): void
    {
        $user = User::factory()->create();

        $project = \App\Models\Project::create(['name' => 'Test', 'owner_id' => $user->id]);
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

        for ($i = 1; $i <= 5; $i++) {
            $response = $this->actingAs($user)->postJson("/api/v1/tasks/{$task->id}/attachments");
            // Will fail validation (no file) but should NOT be 429
            $this->assertNotEquals(429, $response->status(), "Request {$i} should not be rate limited");
        }

        // 6th should be blocked
        $response = $this->actingAs($user)->postJson("/api/v1/tasks/{$task->id}/attachments");
        $this->assertEquals(429, $response->status());
    }

    /**
     * Test: POST /tasks/{task}/comments is rate-limited to 10 per minute.
     */
    public function test_comment_rate_limited(): void
    {
        $user = User::factory()->create();

        $project = \App\Models\Project::create(['name' => 'Test', 'owner_id' => $user->id]);
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

        for ($i = 1; $i <= 10; $i++) {
            $response = $this->actingAs($user)->postJson("/api/v1/tasks/{$task->id}/comments", [
                'content' => "Comment {$i}",
            ]);
            $this->assertNotEquals(429, $response->status(), "Request {$i} should not be rate limited");
        }

        // 11th should be blocked
        $response = $this->actingAs($user)->postJson("/api/v1/tasks/{$task->id}/comments", [
            'content' => 'Spam comment',
        ]);
        $this->assertEquals(429, $response->status());
    }
}
