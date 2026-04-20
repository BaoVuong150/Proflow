<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BoardResource;
use App\Models\Board;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class BoardController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * Display a listing of boards for a project.
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $boards = $project->boards()->latest()->get();

        return $this->success(BoardResource::collection($boards));
    }

    /**
     * Display the specified board.
     */
    public function show(Board $board): JsonResponse
    {
        $this->authorize('view', $board->project);

        $board->load(['columns' => function ($query) {
            $query->orderBy('position')->with(['tasks' => function ($taskQuery) {
                $taskQuery->orderBy('position')
                          ->with(['assignees', 'labels', 'checklists.items']); // Eager load task relations
                
                if (request()->has('priority')) {
                    $taskQuery->where('priority', request('priority'));
                }
                
                if (request()->has('assignee_id')) {
                    $taskQuery->whereHas('assignees', function ($q) {
                        $q->where('users.id', request('assignee_id'));
                    });
                }
                
                if (request()->has('label_id')) {
                    $taskQuery->whereHas('labels', function ($q) {
                        $q->where('labels.id', request('label_id'));
                    });
                }
            }]);
        }]);

        return $this->success(new BoardResource($board));
    }
}
