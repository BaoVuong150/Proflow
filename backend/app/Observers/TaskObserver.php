<?php

namespace App\Observers;

use App\Models\Task;
use App\Services\ActivityLogService;

class TaskObserver
{
    public function saved(Task $task): void
    {
        if ($task->column) {
            \Illuminate\Support\Facades\Cache::tags(["board_{$task->column->board_id}"])->flush();
        }
    }

    public function deleted(Task $task): void
    {
        if ($task->column) {
            \Illuminate\Support\Facades\Cache::tags(["board_{$task->column->board_id}"])->flush();
        }

        if (!auth()->check()) {
            return;
        }

        ActivityLogService::log(
            user: auth()->user(),
            project: $task->project,
            loggable: $task,
            action: 'task.deleted',
            description: "deleted task '{$task->title}'",
        );
    }

    public function created(Task $task): void
    {
        if (!auth()->check()) {
            return;
        }

        ActivityLogService::log(
            user: auth()->user(),
            project: $task->project,
            loggable: $task,
            action: 'task.created',
            description: "created task '{$task->title}'",
        );
    }

    public function updated(Task $task): void
    {
        if (!auth()->check()) {
            return;
        }

        $changes = $task->getChanges();
        $original = $task->getOriginal();

        // Skip if only timestamps changed
        $meaningful = array_diff_key($changes, array_flip(['updated_at', 'created_at']));
        if (empty($meaningful)) {
            return;
        }

        $oldValues = [];
        $newValues = [];
        foreach ($meaningful as $key => $value) {
            $oldValues[$key] = $original[$key] ?? null;
            $newValues[$key] = $value;
        }

        ActivityLogService::log(
            user: auth()->user(),
            project: $task->project,
            loggable: $task,
            action: 'task.updated',
            description: "updated task '{$task->title}'",
            changes: ['old' => $oldValues, 'new' => $newValues],
        );
    }

}
