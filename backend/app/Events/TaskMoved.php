<?php

namespace App\Events;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskMoved implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public $task;
    public $oldColumnId;
    private $boardId;

    public function __construct(Task $task, int $oldColumnId)
    {
        $this->task = $task;
        $this->oldColumnId = $oldColumnId;
        $this->boardId = $task->column->board_id;
    }

    public function broadcastWith(): array
    {
        return [
            'task' => (new TaskResource($this->task))->resolve(),
            'oldColumnId' => $this->oldColumnId,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.' . $this->boardId),
        ];
    }
}
