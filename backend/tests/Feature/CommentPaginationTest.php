<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Board;
use App\Models\Column;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_comments_are_paginated()
    {
        // 1. Setup a user, project, board, column, and task
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        \App\Models\ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'owner'
        ]);

        $board = Board::factory()->create(['project_id' => $project->id]);
        $column = Column::factory()->create(['board_id' => $board->id]);

        $task = Task::factory()->create([
            'project_id' => $project->id,
            'column_id' => $column->id,
            'reporter_id' => $user->id,
        ]);

        // 2. Create 15 comments for the task
        Comment::factory(15)->create([
            'task_id' => $task->id,
            'user_id' => $user->id,
        ]);

        // 3. Act as user and request comments (page 1)
        $response = $this->actingAs($user)->getJson("/api/v1/tasks/{$task->id}/comments");

        // 4. Assert response is paginated (contains data, current_page, etc.)
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data',
                     'meta' => [
                         'current_page',
                         'per_page',
                         'total',
                     ]
                 ]);

        // 5. Assert only 10 items are returned per page
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(15, $response->json('meta.total'));
    }
}
