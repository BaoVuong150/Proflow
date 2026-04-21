<?php

namespace App\Policies;

use App\Enums\ProjectRole;
use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    /**
     * Only the comment author or project Owner/Admin can delete a comment.
     */
    public function delete(User $user, Comment $comment): bool
    {
        // Author can always delete their own comment
        if ($comment->user_id === $user->id) {
            return true;
        }

        // Project Owner/Admin can delete any comment
        $member = $comment->task->project->members()
            ->where('user_id', $user->id)
            ->first();

        if (! $member) {
            return false;
        }

        return in_array($member->role, [ProjectRole::Owner, ProjectRole::Admin]);
    }
}
