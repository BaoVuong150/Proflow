<?php

namespace Tests\Feature;

use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskMoved;
use App\Events\TaskUpdated;
use App\Models\Board;
use App\Models\Column;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class RealtimeSyncTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;
    private Board $board;
    private Column $column;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->project = Project::factory()->create(['owner_id' => $this->user->id]);
        \App\Models\ProjectMember::create([
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'role' => 'admin'
        ]);

        $this->board = Board::factory()->create(['project_id' => $this->project->id]);
        $this->column = Column::factory()->create(['board_id' => $this->board->id, 'name' => 'To Do']);
    }

    public function test_it_broadcasts_task_created_event()
    {
        Event::fake();

        $response = $this->actingAs($this->user)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
            'column_id' => $this->column->id,
            'title' => 'New Realtime Task'
        ]);

        $response->assertStatus(201);

        Event::assertDispatched(TaskCreated::class, function ($event) {
            return $event->task->title === 'New Realtime Task';
        });
    }

    public function test_it_broadcasts_task_updated_event()
    {
        Event::fake();

        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

        $response = $this->actingAs($this->user)->putJson("/api/v1/tasks/{$task->id}", [
            'column_id' => $this->column->id,
            'title' => 'Updated Realtime Task'
        ]);

        $response->assertStatus(200);

        Event::assertDispatched(TaskUpdated::class, function ($event) use ($task) {
            return $event->task->id === $task->id;
        });
    }

    public function test_it_broadcasts_task_deleted_event()
    {
        Event::fake();

        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id]);

        $response = $this->actingAs($this->user)->deleteJson("/api/v1/tasks/{$task->id}");

        $response->assertStatus(200);

        Event::assertDispatched(TaskDeleted::class, function ($event) use ($task) {
            return $event->taskId === $task->id && $event->columnId === $this->column->id;
        });
    }

    public function test_it_broadcasts_task_moved_event()
    {
        Event::fake();

        $column2 = Column::factory()->create(['board_id' => $this->board->id, 'name' => 'Done']);
        $task = Task::factory()->create(['project_id' => $this->project->id, 'column_id' => $this->column->id, 'position' => 0]);

        $response = $this->actingAs($this->user)->postJson("/api/v1/tasks/{$task->id}/move", [
            'column_id' => $column2->id,
            'position' => 0
        ]);

        $response->assertStatus(200);

        Event::assertDispatched(TaskMoved::class, function ($event) use ($task) {
            return $event->task->id === $task->id && $event->oldColumnId === $this->column->id;
        });
    }
}
