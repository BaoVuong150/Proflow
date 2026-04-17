<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Review = 'review';
    case Done = 'done';
    case Closed = 'closed';
}
