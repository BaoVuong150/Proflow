<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChecklistItem;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Checklist;

class ChecklistItemController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * Create a new checklist item.
     */
    public function store(Request $request, Checklist $checklist): JsonResponse
    {
        $this->authorize('update', $checklist->task);

        $request->validate([
            'content' => ['required', 'string', 'max:500'],
        ]);

        $maxPosition = $checklist->items()->max('position') ?? -1;

        $item = $checklist->items()->create([
            'content' => $request->input('content'),
            'position' => $maxPosition + 1,
        ]);

        return $this->success($item, 'Item added successfully', 201);
    }

    /**
     * Update a checklist item.
     */
    public function update(Request $request, ChecklistItem $checklistItem): JsonResponse
    {
        $this->authorize('update', $checklistItem->checklist->task);

        $request->validate([
            'content' => ['required', 'string', 'max:500'],
        ]);

        $checklistItem->update(['content' => $request->input('content')]);

        return $this->success($checklistItem, 'Item updated successfully');
    }

    /**
     * Delete a checklist item.
     */
    public function destroy(ChecklistItem $checklistItem): JsonResponse
    {
        $this->authorize('update', $checklistItem->checklist->task);

        $checklistItem->delete();

        return $this->success(null, 'Item deleted successfully');
    }

    /**
     * Toggle completion status of a checklist item.
     */
    public function toggle(Request $request, ChecklistItem $checklistItem): JsonResponse
    {
        $this->authorize('update', $checklistItem->checklist->task);

        $checklistItem->update([
            'is_completed' => !$checklistItem->is_completed,
            'completed_at' => !$checklistItem->is_completed ? now() : null,
            'completed_by' => !$checklistItem->is_completed ? $request->user()->id : null,
        ]);

        return $this->success($checklistItem->fresh(), 'Item toggled successfully');
    }
}
