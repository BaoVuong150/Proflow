<?php

namespace App\Services;

use App\Models\Board;
use Illuminate\Support\Facades\DB;

class BoardService
{
    /**
     * Reorder columns in a board.
     */
    public function reorderColumns(Board $board, array $columnsData): void
    {
        DB::transaction(function () use ($board, $columnsData) {
            foreach ($columnsData as $data) {
                // Ensure the column actually belongs to the board
                $board->columns()->where('id', $data['id'])->update([
                    'position' => $data['position'],
                ]);
            }
        }, 5);
    }
}
