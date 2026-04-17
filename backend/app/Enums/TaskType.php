<?php

namespace App\Enums;

enum TaskType: string
{
    case Task = 'task';
    case Bug = 'bug';
    case Feature = 'feature';
    case Improvement = 'improvement';
}
