<?php

namespace App\Services;

use App\DTOs\TaskDTO;
use App\Models\Column;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class TaskService
{
    /**
     * Create a new task.
     */
    public function createTask(Project $project, TaskDTO $dto, User $reporter): Task
    {
        $column = Column::where('board_id', function ($query) use ($project) {
            $query->select('id')->from('boards')->where('project_id', $project->id);
        })->findOrFail($dto->columnId);

        if ($column->wip_limit > 0) {
            $currentTaskCount = Task::where('column_id', $column->id)->count();
            if ($currentTaskCount >= $column->wip_limit) {
                throw new BadRequestHttpException("Cannot create task. Column '{$column->name}' has reached its WIP limit of {$column->wip_limit}.");
            }
        }

        $maxPosition = Task::where('column_id', $column->id)->max('position') ?? -1;

        $taskData = $dto->toArray();
        $taskData['project_id'] = $project->id;
        $taskData['reporter_id'] = $reporter->id;
        $taskData['position'] = $maxPosition + 1;

        $task = Task::create($taskData);
        broadcast(new \App\Events\TaskCreated($task))->toOthers();
        return $task;
    }

    /**
     * Update an existing task.
     */
    public function updateTask(Task $task, TaskDTO $dto): Task
    {
        if ($task->column_id !== $dto->columnId) {
            // Validate the new column exists in the same project
            $columnExists = Column::whereHas('board', function ($q) use ($task) {
                $q->where('project_id', $task->project_id);
            })->where('id', $dto->columnId)->exists();

            if (!$columnExists) {
                throw new BadRequestHttpException('Invalid column ID for this project.');
            }
        }

        $task->update($dto->toArray());
        broadcast(new \App\Events\TaskUpdated($task))->toOthers();

        return $task;
    }

    /**
     * Move a task to a new column and position.
     */
    public function moveTask(Task $task, int $newColumnId, int $newPosition): void
    {
        $oldColumnName = $task->column->name;
        $oldColumnId = $task->column_id;

        DB::transaction(function () use ($task, $newColumnId, $newPosition) {
            $currentColumnId = $task->column_id;
            $oldPosition = $task->position;

            // Moving within the same column
            if ($currentColumnId === $newColumnId) {
                if ($oldPosition === $newPosition) {
                    return; // No change
                }

                if ($newPosition > $oldPosition) {
                    // Moving down
                    Task::where('column_id', $currentColumnId)
                        ->whereBetween('position', [$oldPosition + 1, $newPosition])
                        ->decrement('position');
                } else {
                    // Moving up
                    Task::where('column_id', $currentColumnId)
                        ->whereBetween('position', [$newPosition, $oldPosition - 1])
                        ->increment('position');
                }
            } else {
                // Moving to a different column
                $newColumn = Column::whereHas('board', function ($q) use ($task) {
                    $q->where('project_id', $task->project_id);
                })->where('id', $newColumnId)->first();

                if (!$newColumn) {
                    throw new BadRequestHttpException('Invalid column ID for this project.');
                }

                if ($newColumn->wip_limit > 0) {
                    $currentTaskCount = Task::where('column_id', $newColumn->id)->count();
                    if ($currentTaskCount >= $newColumn->wip_limit) {
                        throw new BadRequestHttpException("Cannot move task. Column '{$newColumn->name}' has reached its WIP limit of {$newColumn->wip_limit}.");
                    }
                }

                Task::where('column_id', $currentColumnId)
                    ->where('position', '>', $oldPosition)
                    ->decrement('position');

                Task::where('column_id', $newColumnId)
                    ->where('position', '>=', $newPosition)
                    ->increment('position');
            }

            $task->update([
                'column_id' => $newColumnId,
                'position' => $newPosition,
            ]);
        }, 5);

        // Manual activity log for task.moved
        if (auth()->check()) {
            $newColumnName = Column::find($newColumnId)?->name ?? 'Unknown';
            ActivityLogService::log(
                user: auth()->user(),
                project: $task->project,
                loggable: $task,
                action: 'task.moved',
                description: "moved '{$task->title}' from '{$oldColumnName}' to '{$newColumnName}'",
                changes: ['old' => ['column' => $oldColumnName], 'new' => ['column' => $newColumnName]],
            );
        }

        $task->refresh();
        broadcast(new \App\Events\TaskMoved($task, $oldColumnId))->toOthers();
    }

    /**
     * Assign a user to a task.
     */
    public function assignUser(Task $task, User $user, User $assignedBy): void
    {
        // Ensure user is part of the project
        $isMember = $task->project->members()->where('user_id', $user->id)->exists();
        if (!$isMember) {
            throw new BadRequestHttpException('Cannot assign a user who is not a member of the project.');
        }

        $task->assignees()->syncWithoutDetaching([
            $user->id => ['assigned_by' => $assignedBy->id]
        ]);

        ActivityLogService::log(
            user: $assignedBy,
            project: $task->project,
            loggable: $task,
            action: 'task.assigned',
            description: "assigned {$user->name} to '{$task->title}'",
        );
    }

    /**
     * Unassign a user from a task.
     */
    public function unassignUser(Task $task, User $user): void
    {
        $task->assignees()->detach($user->id);

        if (auth()->check()) {
            ActivityLogService::log(
                user: auth()->user(),
                project: $task->project,
                loggable: $task,
                action: 'task.unassigned',
                description: "unassigned {$user->name} from '{$task->title}'",
            );
        }
    }
    /**
     * Attach a label to a task.
     */
    public function attachLabel(Task $task, \App\Models\Label $label): void
    {
        if ($task->project_id !== $label->project_id) {
            throw new BadRequestHttpException('Label does not belong to the same project.');
        }

        $task->labels()->syncWithoutDetaching([$label->id]);
    }

    /**
     * Detach a label from a task.
     */
    public function detachLabel(Task $task, \App\Models\Label $label): void
    {
        $task->labels()->detach($label->id);
    }
}
