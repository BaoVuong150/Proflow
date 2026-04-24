<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\AttachmentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BoardController;
use App\Http\Controllers\Api\V1\ChecklistController;
use App\Http\Controllers\Api\V1\ChecklistItemController;
use App\Http\Controllers\Api\V1\ColumnController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\LabelController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth.login');

        // Protected routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
        });
    });

    // Protected API Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Projects
        Route::post('projects', [ProjectController::class, 'store'])->middleware('throttle:10,1');
        Route::apiResource('projects', ProjectController::class)->except(['store']);
        Route::post('projects/{project}/members', [ProjectController::class, 'addMember']);
        Route::delete('projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

        // Boards
        Route::get('projects/{project}/boards', [BoardController::class, 'index']);
        Route::get('boards/{board}', [BoardController::class, 'show']);

        // Columns
        Route::post('boards/{board}/columns', [ColumnController::class, 'store']);
        Route::put('columns/{column}', [ColumnController::class, 'update']);
        Route::delete('columns/{column}', [ColumnController::class, 'destroy']);
        Route::put('boards/{board}/columns/reorder', [ColumnController::class, 'reorder'])->middleware('throttle:5,1');

        // Labels
        Route::get('projects/{project}/labels', [LabelController::class, 'index']);
        Route::post('projects/{project}/labels', [LabelController::class, 'store']);
        Route::put('labels/{label}', [LabelController::class, 'update']);
        Route::delete('labels/{label}', [LabelController::class, 'destroy']);

        // Tasks
        Route::post('projects/{project}/tasks', [TaskController::class, 'store'])->middleware('throttle:30,1');
        Route::get('tasks/{task}', [TaskController::class, 'show']);
        Route::put('tasks/{task}', [TaskController::class, 'update']);
        Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
        Route::post('tasks/{task}/move', [TaskController::class, 'move'])->middleware('throttle:5,1');
        Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);
        Route::delete('tasks/{task}/assign/{user}', [TaskController::class, 'unassign']);
        Route::post('tasks/{task}/labels', [TaskController::class, 'attachLabel']);
        Route::delete('tasks/{task}/labels/{labelId}', [TaskController::class, 'detachLabel']);

        // ---------------------------------------------------------------------
        // TODO (Developer Note): Checklists & Checklist Items
        // These endpoints and their corresponding logic are fully implemented.
        // However, the feature is currently hidden on the Frontend UI for the MVP.
        // Do NOT remove these endpoints. Keep them for future iterations.
        // ---------------------------------------------------------------------
        Route::get('tasks/{task}/checklists', [ChecklistController::class, 'index']);
        Route::post('tasks/{task}/checklists', [ChecklistController::class, 'store']);
        Route::put('checklists/{checklist}', [ChecklistController::class, 'update']);
        Route::delete('checklists/{checklist}', [ChecklistController::class, 'destroy']);

        // Checklist Items
        Route::post('checklists/{checklist}/items', [ChecklistItemController::class, 'store']);
        Route::put('checklist-items/{checklistItem}', [ChecklistItemController::class, 'update']);
        Route::delete('checklist-items/{checklistItem}', [ChecklistItemController::class, 'destroy']);
        Route::put('checklist-items/{checklistItem}/toggle', [ChecklistItemController::class, 'toggle']);

        // Comments
        Route::get('tasks/{task}/comments', [CommentController::class, 'index']);
        Route::post('tasks/{task}/comments', [CommentController::class, 'store'])->middleware('throttle:10,1');
        Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

        // Attachments
        Route::get('tasks/{task}/attachments', [AttachmentController::class, 'index']);
        Route::post('tasks/{task}/attachments', [AttachmentController::class, 'store'])->middleware('throttle:5,1');
        Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy']);

        // Activity Log
        Route::get('projects/{project}/activity', [ActivityLogController::class, 'index']);
    });
});
