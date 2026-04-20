<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProjectRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function __construct(private ProjectService $projectService)
    {
    }

    /**
     * Display a listing of the user's projects.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $cacheKey = "user_{$userId}_projects";

        $projects = \Illuminate\Support\Facades\Cache::tags(["user_{$userId}"])->remember($cacheKey, 3600, function () use ($userId) {
            return Project::whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->with(['owner', 'boards'])
            ->latest()
            ->get();
        });

        return $this->success(ProjectResource::collection($projects));
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject(
            $request->user(),
            $request->validated()
        );

        // Invalidate user projects cache
        \Illuminate\Support\Facades\Cache::tags(["user_" . $request->user()->id])->flush();

        return $this->success(
            new ProjectResource($project),
            'Project created successfully',
            201
        );
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $cacheKey = "project_{$project->id}";
        $projectData = \Illuminate\Support\Facades\Cache::tags(["project_{$project->id}"])->remember($cacheKey, 3600, function () use ($project) {
            return $project->load(['owner', 'members.user', 'boards']);
        });

        return $this->success(
            new ProjectResource($projectData)
        );
    }

    /**
     * Update the specified project in storage.
     */
    public function update(StoreProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());
        \Illuminate\Support\Facades\Cache::tags(["project_{$project->id}", "user_" . $request->user()->id])->flush();

        return $this->success(
            new ProjectResource($project->fresh('owner')),
            'Project updated successfully'
        );
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();
        \Illuminate\Support\Facades\Cache::tags(["project_{$project->id}", "user_" . request()->user()->id])->flush();

        return $this->success(null, 'Project deleted successfully');
    }

    /**
     * Add a member to the project.
     */
    public function addMember(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $request->validate([
            'email' => ['required', 'email'],
            'role' => ['nullable', 'string'],
        ]);

        $role = $request->input('role') 
            ? ProjectRole::tryFrom($request->input('role')) ?? ProjectRole::Member 
            : ProjectRole::Member;

        $project = $this->projectService->addMember($project, $request->input('email'), $role);
        
        \Illuminate\Support\Facades\Cache::tags(["project_{$project->id}"])->flush();
        // Also invalidate for the added user
        $user = \App\Models\User::where('email', $request->input('email'))->first();
        if ($user) \Illuminate\Support\Facades\Cache::tags(["user_{$user->id}"])->flush();

        return $this->success(
            new ProjectResource($project),
            'Member added successfully'
        );
    }

    /**
     * Remove a member from the project.
     */
    public function removeMember(Project $project, int $userId): JsonResponse
    {
        $this->authorize('manageMembers', $project);

        $this->projectService->removeMember($project, $userId);
        
        \Illuminate\Support\Facades\Cache::tags(["project_{$project->id}", "user_{$userId}"])->flush();

        return $this->success(null, 'Member removed successfully');
    }
}
