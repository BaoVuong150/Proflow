<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'project_id' => $this->project_id,
            'column_id' => $this->column_id,
            'reporter_id' => $this->reporter_id,
            'position' => $this->position,
            'type' => $this->type,
            'status' => $this->status,
            'priority' => $this->priority,
            'start_date' => $this->start_date,
            'due_date' => $this->due_date,
            'completed_at' => $this->completed_at,
            'estimated_hours' => $this->estimated_hours,
            'actual_hours' => $this->actual_hours,
            'is_archived' => $this->is_archived,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // Relationships (if loaded)
            'assignees' => UserResource::collection($this->whenLoaded('assignees')),
            'labels' => LabelResource::collection($this->whenLoaded('labels')),
            'checklists' => $this->whenLoaded('checklists', function () {
                return $this->checklists->map(function ($checklist) {
                    return [
                        'id' => $checklist->id,
                        'task_id' => $checklist->task_id,
                        'title' => $checklist->title,
                        'position' => $checklist->position,
                        'items' => $checklist->relationLoaded('items') ? $checklist->items : [],
                    ];
                });
            }),

            // Computed: checklist progress
            'checklist_progress' => $this->when(
                $this->relationLoaded('checklists'),
                function () {
                    $total = 0;
                    $completed = 0;
                    foreach ($this->checklists as $checklist) {
                        if ($checklist->relationLoaded('items')) {
                            $total += $checklist->items->count();
                            $completed += $checklist->items->where('is_completed', true)->count();
                        }
                    }
                    return $total > 0 ? round(($completed / $total) * 100) : null;
                }
            ),
        ];
    }
}
