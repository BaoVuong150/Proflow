<?php

namespace App\Policies;

use App\Enums\ProjectRole;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view the task.
     */
    public function view(User $user, Task $task): bool
    {
        return $task->project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        $member = $task->project->members()->where('user_id', $user->id)->first();
        if (!$member) {
            return false;
        }

        if (in_array($member->role, [ProjectRole::Owner, ProjectRole::Admin])) {
            return true;
        }

        // Regular members can edit if they are the reporter or assignee, or if we allow all members to edit
        // For Kanban, typically all members can move/edit tasks
        return $member->role === ProjectRole::Member;
    }

    /**
     * Determine whether the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        $member = $task->project->members()->where('user_id', $user->id)->first();
        if (!$member) {
            return false;
        }

        // Only Owner, Admin, or the original reporter can delete
        if (in_array($member->role, [ProjectRole::Owner, ProjectRole::Admin])) {
            return true;
        }

        return $task->reporter_id === $user->id;
    }
}
