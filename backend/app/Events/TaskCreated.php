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

class TaskCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    private $boardId;

    public function __construct(Task $task)
    {
        $this->task = new TaskResource($task);
        $this->boardId = $task->column->board_id;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.' . $this->boardId),
        ];
    }
}
