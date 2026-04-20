<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserQuota extends Model
{
    protected $fillable = [
        'user_id',
        'storage_used',
        'storage_limit',
        'file_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user has enough quota for a given file size.
     */
    public function hasQuotaFor(int $fileSize): bool
    {
        return ($this->storage_used + $fileSize) <= $this->storage_limit;
    }

    /**
     * Get remaining storage in bytes.
     */
    public function remainingStorage(): int
    {
        return max(0, $this->storage_limit - $this->storage_used);
    }
}
