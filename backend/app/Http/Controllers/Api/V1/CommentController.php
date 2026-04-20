<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * List comments for a task (newest first).
     */
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $comments = $task->comments()
            ->with('user')
            ->latest()
            ->paginate(10);

        return $this->success($comments);
    }

    /**
     * Add a comment to a task.
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
        ]);

        $comment->load('user');

        return $this->success(
            new CommentResource($comment),
            'Comment added successfully',
            201
        );
    }

    /**
     * Delete a comment.
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return $this->success(null, 'Comment deleted successfully');
    }
}
