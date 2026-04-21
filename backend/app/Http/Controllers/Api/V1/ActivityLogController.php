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
    use ApiResponse;
    use AuthorizesRequests;

    /**
     * List activity logs for a project (paginated, newest first).
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $query = $project->activityLogs()->with('user')->latest();

        if (request()->has('loggable_type') && request()->has('loggable_id')) {
            $query->where('loggable_type', request('loggable_type'))
                  ->where('loggable_id', request('loggable_id'));
        }

        $logs = $query->paginate(10);

        return $this->success(
            ActivityLogResource::collection($logs)->response()->getData(true)
        );
    }
}
