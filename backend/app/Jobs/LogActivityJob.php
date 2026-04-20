<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class LogActivityJob implements ShouldQueue
{
    use Queueable;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    /**
     * Create a new job instance.
     */
    public function __construct(public array $logData)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        \App\Models\ActivityLog::create($this->logData);
    }
}
