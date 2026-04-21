<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $taskId;
    public $columnId;
    private $boardId;

    public function __construct(int $taskId, int $columnId, int $boardId)
    {
        $this->taskId = $taskId;
        $this->columnId = $columnId;
        $this->boardId = $boardId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.' . $this->boardId),
        ];
    }
}
