<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderColumnRequest;
use App\Http\Requests\StoreColumnRequest;
use App\Http\Resources\ColumnResource;
use App\Models\Board;
use App\Models\Column;
use App\Services\ActivityLogService;
use App\Services\BoardService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class ColumnController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function __construct(private BoardService $boardService)
    {
    }

    /**
     * Store a newly created column in storage.
     */
    public function store(StoreColumnRequest $request, Board $board): JsonResponse
    {
        $this->authorize('update', $board->project);

        $maxPosition = $board->columns()->max('position') ?? -1;

        $column = $board->columns()->create([
            'name' => $request->input('name'),
            'color' => $request->input('color'),
            'position' => $maxPosition + 1,
        ]);

        ActivityLogService::log(
            user: $request->user(),
            project: $board->project,
            loggable: $column,
            action: 'column.created',
            description: "created column '{$column->name}'",
        );

        return $this->success(
            new ColumnResource($column),
            'Column created successfully',
            201
        );
    }

    /**
     * Update the specified column in storage.
     */
    public function update(StoreColumnRequest $request, Column $column): JsonResponse
    {
        $this->authorize('update', $column->board->project);

        $oldName = $column->name;
        $column->update($request->validated());

        ActivityLogService::log(
            user: $request->user(),
            project: $column->board->project,
            loggable: $column,
            action: 'column.updated',
            description: "renamed column from '{$oldName}' to '{$column->name}'",
            changes: ['old' => ['name' => $oldName], 'new' => ['name' => $column->name]],
        );

        return $this->success(
            new ColumnResource($column),
            'Column updated successfully'
        );
    }

    /**
     * Remove the specified column from storage.
     */
    public function destroy(Column $column): JsonResponse
    {
        $this->authorize('update', $column->board->project);

        if ($column->tasks()->exists()) {
            return $this->error('Cannot delete a column that contains tasks. Please move or delete the tasks first.', 400);
        }

        $columnName = $column->name;
        $project = $column->board->project;

        ActivityLogService::log(
            user: auth()->user(),
            project: $project,
            loggable: $column,
            action: 'column.deleted',
            description: "deleted column '{$columnName}'",
        );

        $column->delete();

        return $this->success(null, 'Column deleted successfully');
    }

    /**
     * Reorder columns within a board.
     */
    public function reorder(ReorderColumnRequest $request, Board $board): JsonResponse
    {
        $this->authorize('update', $board->project);

        $this->boardService->reorderColumns($board, $request->input('columns'));

        return $this->success(null, 'Columns reordered successfully');
    }
}
