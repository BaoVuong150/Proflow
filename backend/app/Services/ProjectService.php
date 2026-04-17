<?php

namespace App\Services;

use App\Enums\ProjectRole;
use App\Models\Board;
use App\Models\Project;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ProjectService
{
    /**
     * Create a new project with default board and columns.
     */
    public function createProject(User $owner, array $data): Project
    {
        return DB::transaction(function () use ($owner, $data) {
            // 1. Create the project
            $project = Project::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'owner_id' => $owner->id,
            ]);

            // 2. Add owner to members table
            $project->members()->create([
                'user_id' => $owner->id,
                'role' => ProjectRole::Owner,
            ]);

            // 3. Create default board
            $board = Board::create([
                'project_id' => $project->id,
                'name' => 'Main Board',
                'description' => 'Default project board',
            ]);

            // 4. Create default columns
            $columns = ['To Do', 'In Progress', 'In Review', 'Done'];
            foreach ($columns as $index => $colName) {
                $board->columns()->create([
                    'name' => $colName,
                    'position' => $index,
                ]);
            }

            return $project->load('owner');
        });
    }

    /**
     * Add a member to the project by email.
     */
    public function addMember(Project $project, string $email, ProjectRole $role = ProjectRole::Member): Project
    {
        $user = User::where('email', $email)->first();
        if (! $user) {
            throw new NotFoundHttpException('User with this email not found.');
        }

        if ($project->members()->where('user_id', $user->id)->exists()) {
            throw new \Symfony\Component\HttpKernel\Exception\BadRequestHttpException('User is already a member of this project.');
        }

        $project->members()->create([
            'user_id' => $user->id,
            'role' => $role,
        ]);

        // Log member added
        if (auth()->check()) {
            ActivityLogService::log(
                user: auth()->user(),
                project: $project,
                loggable: $project,
                action: 'member.added',
                description: "added {$user->name} as {$role->value}",
            );
        }

        return $project->load('members.user');
    }

    /**
     * Remove a member from the project.
     */
    public function removeMember(Project $project, int $userId): void
    {
        if ($project->owner_id === $userId) {
            throw new AccessDeniedHttpException('Cannot remove the project owner.');
        }

        $user = User::find($userId);
        DB::transaction(function () use ($project, $userId, $user) {
            // Prevent orphaned assignments: remove user from tasks in this project
            DB::table('task_assignments')
                ->whereIn('task_id', function ($query) use ($project) {
                    $query->select('id')->from('tasks')->where('project_id', $project->id);
                })
                ->where('user_id', $userId)
                ->delete();

            $project->members()->where('user_id', $userId)->delete();
        });

        // Log member removed
        if (auth()->check() && $user) {
            ActivityLogService::log(
                user: auth()->user(),
                project: $project,
                loggable: $project,
                action: 'member.removed',
                description: "removed {$user->name}",
            );
        }
    }
}
