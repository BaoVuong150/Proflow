<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\TaskDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\MoveTaskRequest;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Label;
use App\Services\TaskService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Tasks
 *
 * APIs for managing Kanban tasks.
 */
class TaskController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    public function __construct(private TaskService $taskService)
    {
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $dto = TaskDTO::fromArray($request->validated());

        $task = $this->taskService->createTask($project, $dto, $request->user());

        $task->load('assignees');

        return $this->success(
            new TaskResource($task),
            'Task created successfully',
            201
        );
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load(['assignees', 'labels', 'reporter']);

        return $this->success(new TaskResource($task));
    }

    /**
     * Update the specified task in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $dto = TaskDTO::fromArray($request->validated());

        $task = $this->taskService->updateTask($task, $dto);

        $task->load('assignees');

        return $this->success(
            new TaskResource($task),
            'Task updated successfully'
        );
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $taskId = $task->id;
        $columnId = $task->column_id;
        $boardId = $task->column->board_id;

        $task->delete();

        broadcast(new \App\Events\TaskDeleted($taskId, $columnId, $boardId))->toOthers();

        return $this->success(null, 'Task deleted successfully');
    }

    /**
     * Move a task to a different position/column.
     */
    public function move(MoveTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $this->taskService->moveTask(
            $task,
            $request->input('column_id'),
            $request->input('position')
        );

        return $this->success(null, 'Task moved successfully');
    }

    /**
     * Assign a user to the task.
     */
    public function assign(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($request->input('user_id'));

        $this->taskService->assignUser($task, $user, $request->user());

        return $this->success(null, 'User assigned successfully');
    }

    /**
     * Unassign a user from the task.
     */
    public function unassign(Task $task, int $userId): JsonResponse
    {
        $this->authorize('update', $task);

        $user = User::findOrFail($userId);

        $this->taskService->unassignUser($task, $user);

        return $this->success(null, 'User unassigned successfully');
    }
    /**
     * Attach a label to the task.
     */
    public function attachLabel(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'label_id' => ['required', 'integer', 'exists:labels,id'],
        ]);

        $label = Label::findOrFail($request->input('label_id'));

        $this->taskService->attachLabel($task, $label);

        return $this->success(null, 'Label attached successfully');
    }

    /**
     * Detach a label from the task.
     */
    public function detachLabel(Task $task, int $labelId): JsonResponse
    {
        $this->authorize('update', $task);

        $label = Label::findOrFail($labelId);

        $this->taskService->detachLabel($task, $label);

        return $this->success(null, 'Label detached successfully');
    }
}
