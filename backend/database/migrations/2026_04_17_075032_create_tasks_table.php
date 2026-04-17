<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('column_id')->constrained('columns')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title', 500);
            $table->longText('description')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->enum('priority', array_column(TaskPriority::cases(), 'value'))->default(TaskPriority::Medium->value);
            $table->enum('type', array_column(TaskType::cases(), 'value'))->default(TaskType::Task->value);
            $table->enum('status', array_column(TaskStatus::cases(), 'value'))->default(TaskStatus::Open->value);
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('estimated_hours', 5, 1)->nullable();
            $table->decimal('actual_hours', 5, 1)->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index('status', 'idx_tasks_status');
            $table->index('priority', 'idx_tasks_priority');
            $table->index('due_date', 'idx_tasks_due');
            $table->index('position', 'idx_tasks_position');

            if (config('database.default') !== 'sqlite') {
                $table->fullText(['title', 'description'], 'ft_tasks_search');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
