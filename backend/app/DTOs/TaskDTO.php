<?php

namespace App\DTOs;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;

readonly class TaskDTO
{
    public function __construct(
        public string $title,
        public int $columnId,
        public ?string $description = null,
        public ?TaskType $type = null,
        public ?TaskPriority $priority = null,
        public ?TaskStatus $status = null,
        public ?string $dueDate = null,
        public ?string $startDate = null,
        public ?float $estimatedHours = null
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            title: $data['title'],
            columnId: $data['column_id'],
            description: $data['description'] ?? null,
            type: isset($data['type']) ? TaskType::tryFrom($data['type']) : null,
            priority: isset($data['priority']) ? TaskPriority::tryFrom($data['priority']) : null,
            status: isset($data['status']) ? TaskStatus::tryFrom($data['status']) : null,
            dueDate: $data['due_date'] ?? null,
            startDate: $data['start_date'] ?? null,
            estimatedHours: isset($data['estimated_hours']) ? (float) $data['estimated_hours'] : null,
        );
    }
    
    public function toArray(): array
    {
        return array_filter([
            'title' => $this->title,
            'column_id' => $this->columnId,
            'description' => $this->description,
            'type' => $this->type?->value,
            'priority' => $this->priority?->value,
            'status' => $this->status?->value,
            'due_date' => $this->dueDate,
            'start_date' => $this->startDate,
            'estimated_hours' => $this->estimatedHours,
        ], fn($value) => !is_null($value));
    }
}
