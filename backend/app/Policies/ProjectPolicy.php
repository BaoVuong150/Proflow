<?php

namespace App\Policies;

use App\Enums\ProjectRole;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        return $project->members()
            ->where('user_id', $user->id)
            ->whereIn('role', [ProjectRole::Owner, ProjectRole::Admin])
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }
    
    /**
     * Determine whether the user can manage members.
     */
    public function manageMembers(User $user, Project $project): bool
    {
        return $project->members()
            ->where('user_id', $user->id)
            ->whereIn('role', [ProjectRole::Owner, ProjectRole::Admin])
            ->exists();
    }
}
