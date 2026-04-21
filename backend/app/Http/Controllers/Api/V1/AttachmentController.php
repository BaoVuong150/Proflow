<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttachmentResource;
use App\Models\Attachment;
use App\Models\Task;
use App\Services\FileUploadService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    public function __construct(private FileUploadService $fileUploadService)
    {
    }

    /**
     * List attachments for a task.
     */
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $attachments = $task->attachments()
            ->with('uploader')
            ->latest()
            ->paginate(10);

        return $this->paginated($attachments);
    }

    /**
     * Upload a file attachment to a task.
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $fileData = $this->fileUploadService->upload(
            $request->file('file'),
            $request->user()->id
        );

        $attachment = $task->attachments()->create(array_merge($fileData, [
            'user_id' => $request->user()->id,
        ]));

        $attachment->load('uploader');

        return $this->success(
            new AttachmentResource($attachment),
            'File uploaded successfully',
            201
        );
    }

    /**
     * Delete an attachment.
     */
    public function destroy(Request $request, Attachment $attachment): JsonResponse
    {
        // Only uploader or project owner/admin can delete
        $task = $attachment->attachable;
        $this->authorize('update', $task);

        $this->fileUploadService->delete(
            $attachment->file_path,
            $attachment->user_id,
            $attachment->file_size
        );

        $attachment->delete();

        return $this->success(null, 'Attachment deleted successfully');
    }
}
