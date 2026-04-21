<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Checklist;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    /**
     * List checklists for a task.
     */
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $checklists = $task->checklists()
            ->with(['items' => fn ($q) => $q->orderBy('position')])
            ->orderBy('position')
            ->get();

        return $this->success($checklists);
    }

    /**
     * Create a new checklist for a task.
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $maxPosition = $task->checklists()->max('position') ?? -1;

        $checklist = $task->checklists()->create([
            'title' => $request->input('title'),
            'position' => $maxPosition + 1,
        ]);

        $checklist->load('items');

        return $this->success($checklist, 'Checklist created successfully', 201);
    }

    /**
     * Update a checklist.
     */
    public function update(Request $request, Checklist $checklist): JsonResponse
    {
        $this->authorize('update', $checklist->task);

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $checklist->update(['title' => $request->input('title')]);

        return $this->success($checklist, 'Checklist updated successfully');
    }

    /**
     * Delete a checklist.
     */
    public function destroy(Checklist $checklist): JsonResponse
    {
        $this->authorize('update', $checklist->task);

        $checklist->delete();

        return $this->success(null, 'Checklist deleted successfully');
    }
}
