<?php

namespace App\Events;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $oldColumnId;
    private $boardId;

    public function __construct(Task $task, int $oldColumnId)
    {
        $this->task = new TaskResource($task);
        $this->oldColumnId = $oldColumnId;
        $this->boardId = $task->column->board_id;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.' . $this->boardId),
        ];
    }
}
