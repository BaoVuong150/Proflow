<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * List activity logs for a project (paginated, newest first).
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $logs = $project->activityLogs()
            ->with('user')
            ->latest()
            ->paginate(20);

        return $this->success(
            ActivityLogResource::collection($logs)->response()->getData(true)
        );
    }
}
