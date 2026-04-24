<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log an activity.
     */
    public static function log(
        ?User $user,
        Project $project,
        Model $loggable,
        string $action,
        ?string $description = null,
        ?array $changes = null,
    ): void {
        $logData = [
            'user_id' => $user?->id,
            'project_id' => $project->id,
            'loggable_type' => get_class($loggable),
            'loggable_id' => $loggable->id,
            'action' => $action,
            'description' => $description,
            'changes' => $changes,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ];

        \App\Jobs\LogActivityJob::dispatchSync($logData);
    }
}
