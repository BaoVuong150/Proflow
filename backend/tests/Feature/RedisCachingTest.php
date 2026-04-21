<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RedisCachingTest extends TestCase
{
    use RefreshDatabase;

    public function test_board_data_is_cached_and_invalidated_on_task_update()
    {
        // 1. Setup
        $user = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $user->id]);
        $project->members()->create(['user_id' => $user->id, 'role' => 'owner']);
        $board = Board::factory()->create(['project_id' => $project->id]);
        $column = Column::factory()->create(['board_id' => $board->id]);
        $task = Task::factory()->create([
            'project_id' => $project->id,
            'column_id' => $column->id,
            'reporter_id' => $user->id,
        ]);

        $cacheKey = "board_{$board->id}_" . md5(json_encode([]));

        // 2. Fetch Board (Should Cache)
        $this->actingAs($user)->getJson("/api/v1/boards/{$board->id}");

        // Assert cache has the board
        $this->assertTrue(Cache::tags(["board_{$board->id}"])->has($cacheKey));

        // 3. Update Task (Should Invalidate Cache)
        $this->actingAs($user)->putJson("/api/v1/tasks/{$task->id}", [
            'title' => 'New Title',
            'column_id' => $column->id,
        ]);

        // Assert cache is empty after task update
        $this->assertFalse(Cache::tags(["board_{$board->id}"])->has($cacheKey));
    }

    public function test_project_list_is_cached_and_invalidated_on_project_create()
    {
        $user = User::factory()->create();
        // Projects list is paginated now, so cache key has page number
        $cacheKey = "user_{$user->id}_projects_page_1";

        // Fetch projects
        $this->actingAs($user)->getJson("/api/v1/projects");
        $this->assertTrue(Cache::tags(["user_{$user->id}"])->has($cacheKey));

        // Create new project
        $this->actingAs($user)->postJson("/api/v1/projects", [
            'name' => 'New Project',
        ]);

        // Assert cache is invalidated
        $this->assertFalse(Cache::tags(["user_{$user->id}"])->has($cacheKey));
    }
}
