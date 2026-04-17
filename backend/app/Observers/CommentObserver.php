<?php

namespace App\Observers;

use App\Models\Comment;
use App\Services\ActivityLogService;

class CommentObserver
{
    public function created(Comment $comment): void
    {
        if (!auth()->check()) {
            return;
        }

        ActivityLogService::log(
            user: auth()->user(),
            project: $comment->task->project,
            loggable: $comment,
            action: 'comment.created',
            description: "commented on '{$comment->task->title}'",
        );
    }

    public function deleted(Comment $comment): void
    {
        if (!auth()->check()) {
            return;
        }

        ActivityLogService::log(
            user: auth()->user(),
            project: $comment->task->project,
            loggable: $comment,
            action: 'comment.deleted',
            description: "deleted a comment on '{$comment->task->title}'",
        );
    }
}
