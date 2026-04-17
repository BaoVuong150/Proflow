<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLabelRequest;
use App\Http\Requests\UpdateLabelRequest;
use App\Http\Resources\LabelResource;
use App\Models\Label;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class LabelController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return $this->success(
            LabelResource::collection($project->labels)
        );
    }

    public function store(StoreLabelRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $label = $project->labels()->create($request->validated());

        return $this->success(
            new LabelResource($label),
            'Label created successfully',
            201
        );
    }

    public function update(UpdateLabelRequest $request, Label $label): JsonResponse
    {
        $this->authorize('update', $label->project);

        $label->update($request->validated());

        return $this->success(
            new LabelResource($label),
            'Label updated successfully'
        );
    }

    public function destroy(Label $label): JsonResponse
    {
        $this->authorize('update', $label->project);

        $label->delete();

        return $this->success(null, 'Label deleted successfully');
    }
}
