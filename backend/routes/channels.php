<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('board.{boardId}', function ($user, $boardId) {
    $board = \App\Models\Board::find($boardId);
    if (! $board) {
        return false;
    }

    // Only project members can listen
    return $board->project->members()->where('user_id', $user->id)->exists();
});
