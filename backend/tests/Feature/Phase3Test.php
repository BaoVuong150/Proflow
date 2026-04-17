<?php

use App\Models\Board;
use App\Models\Checklist;
use App\Models\ChecklistItem;
use App\Models\Column;
use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Enums\ProjectRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->member = User::factory()->create();
    $this->outsider = User::factory()->create();
    $this->project = Project::factory()->create(['owner_id' => $this->owner->id]);
    $this->project->members()->create(['user_id' => $this->owner->id, 'role' => ProjectRole::Owner]);
    $this->project->members()->create(['user_id' => $this->member->id, 'role' => ProjectRole::Member]);

    $this->board = Board::factory()->create(['project_id' => $this->project->id]);
    $this->column = Column::factory()->create(['board_id' => $this->board->id]);
    $this->task = Task::factory()->create([
        'project_id' => $this->project->id,
        'column_id' => $this->column->id,
        'reporter_id' => $this->owner->id,
    ]);
});

// =============================================
// CHECKLISTS — Happy Path
// =============================================

it('can create a checklist for a task', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/checklists", [
        'title' => 'Dev Checklist',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('checklists', [
        'task_id' => $this->task->id,
        'title' => 'Dev Checklist',
        'position' => 0,
    ]);
});

it('auto-increments checklist position', function () {
    $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/checklists", [
        'title' => 'First',
    ]);
    $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/checklists", [
        'title' => 'Second',
    ]);

    $this->assertDatabaseHas('checklists', ['title' => 'First', 'position' => 0]);
    $this->assertDatabaseHas('checklists', ['title' => 'Second', 'position' => 1]);
});

it('can list checklists with items for a task', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);
    ChecklistItem::factory()->count(3)->create(['checklist_id' => $checklist->id]);

    $response = $this->actingAs($this->owner)->getJson("/api/v1/tasks/{$this->task->id}/checklists");

    $response->assertStatus(200);
    // Verify items are eager-loaded
    $data = $response->json('data');
    expect($data)->toHaveCount(1);
    expect($data[0]['items'])->toHaveCount(3);
});

it('can update a checklist title', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id, 'title' => 'Old']);

    $response = $this->actingAs($this->owner)->putJson("/api/v1/checklists/{$checklist->id}", [
        'title' => 'New Title',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('checklists', ['id' => $checklist->id, 'title' => 'New Title']);
});

it('can delete a checklist and cascades items', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);
    $item = ChecklistItem::factory()->create(['checklist_id' => $checklist->id]);

    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/checklists/{$checklist->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('checklists', ['id' => $checklist->id]);
    $this->assertDatabaseMissing('checklist_items', ['id' => $item->id]);
});

it('allows a member to create a checklist', function () {
    $response = $this->actingAs($this->member)->postJson("/api/v1/tasks/{$this->task->id}/checklists", [
        'title' => 'Member Checklist',
    ]);

    $response->assertStatus(201);
});

// =============================================
// CHECKLIST ITEMS — Happy Path
// =============================================

it('can add an item to a checklist', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/checklists/{$checklist->id}/items", [
        'content' => 'Write unit tests',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('checklist_items', [
        'checklist_id' => $checklist->id,
        'content' => 'Write unit tests',
        'is_completed' => false,
    ]);
});

it('can update a checklist item content', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);
    $item = ChecklistItem::factory()->create(['checklist_id' => $checklist->id, 'content' => 'Old']);

    $response = $this->actingAs($this->owner)->putJson("/api/v1/checklist-items/{$item->id}", [
        'content' => 'Updated content',
    ]);

    $response->assertStatus(200);
    $this->assertDatabaseHas('checklist_items', ['id' => $item->id, 'content' => 'Updated content']);
});

it('can toggle a checklist item on and off', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);
    $item = ChecklistItem::factory()->create([
        'checklist_id' => $checklist->id,
        'is_completed' => false,
    ]);

    // Toggle ON
    $response = $this->actingAs($this->owner)->putJson("/api/v1/checklist-items/{$item->id}/toggle");
    $response->assertStatus(200);
    $item->refresh();
    expect($item->is_completed)->toBeTrue();
    expect($item->completed_at)->not->toBeNull();
    expect($item->completed_by)->toBe($this->owner->id);

    // Toggle OFF
    $response = $this->actingAs($this->owner)->putJson("/api/v1/checklist-items/{$item->id}/toggle");
    $response->assertStatus(200);
    $item->refresh();
    expect($item->is_completed)->toBeFalse();
    expect($item->completed_at)->toBeNull();
    expect($item->completed_by)->toBeNull();
});

it('can delete a checklist item', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);
    $item = ChecklistItem::factory()->create(['checklist_id' => $checklist->id]);

    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/checklist-items/{$item->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('checklist_items', ['id' => $item->id]);
});

// =============================================
// COMMENTS — Happy Path
// =============================================

it('can add a comment to a task', function () {
    $response = $this->actingAs($this->member)->postJson("/api/v1/tasks/{$this->task->id}/comments", [
        'content' => 'Looks good!',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.content', 'Looks good!')
        ->assertJsonPath('data.user_id', $this->member->id);

    $this->assertDatabaseHas('comments', [
        'task_id' => $this->task->id,
        'user_id' => $this->member->id,
        'content' => 'Looks good!',
    ]);
});

it('can list comments newest first', function () {
    $comment1 = Comment::factory()->create(['task_id' => $this->task->id, 'user_id' => $this->owner->id, 'created_at' => now()->subMinute()]);
    $comment2 = Comment::factory()->create(['task_id' => $this->task->id, 'user_id' => $this->member->id, 'created_at' => now()]);

    $response = $this->actingAs($this->owner)->getJson("/api/v1/tasks/{$this->task->id}/comments");

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data');

    $data = $response->json('data');
    // Newest first
    expect($data[0]['id'])->toBe($comment2->id);
    expect($data[1]['id'])->toBe($comment1->id);
});

it('returns user info with comments', function () {
    Comment::factory()->create(['task_id' => $this->task->id, 'user_id' => $this->member->id]);

    $response = $this->actingAs($this->owner)->getJson("/api/v1/tasks/{$this->task->id}/comments");

    $response->assertStatus(200)
        ->assertJsonPath('data.0.user.id', $this->member->id);
});

it('allows the author to delete their own comment', function () {
    $comment = Comment::factory()->create([
        'task_id' => $this->task->id,
        'user_id' => $this->member->id,
    ]);

    $response = $this->actingAs($this->member)->deleteJson("/api/v1/comments/{$comment->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

it('allows owner to delete any comment', function () {
    $comment = Comment::factory()->create([
        'task_id' => $this->task->id,
        'user_id' => $this->member->id,
    ]);

    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/comments/{$comment->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
});

// =============================================
// ATTACHMENTS — Happy Path
// =============================================

it('can upload a file attachment to a task', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/attachments", [
        'file' => $file,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.original_name', 'document.pdf')
        ->assertJsonPath('data.user_id', $this->owner->id);

    $this->assertDatabaseHas('attachments', [
        'attachable_id' => $this->task->id,
        'attachable_type' => Task::class,
        'original_name' => 'document.pdf',
    ]);
});

it('stores file to public disk', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('report.pdf', 200, 'application/pdf');

    $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/attachments", [
        'file' => $file,
    ]);

    // Assert file was stored
    $attachment = $this->task->attachments()->first();
    Storage::disk('public')->assertExists($attachment->file_path);
});

it('can list attachments for a task', function () {
    $this->task->attachments()->create([
        'user_id' => $this->owner->id,
        'original_name' => 'test.pdf',
        'file_path' => 'attachments/test.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
    ]);

    $response = $this->actingAs($this->owner)->getJson("/api/v1/tasks/{$this->task->id}/attachments");

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.original_name', 'test.pdf');
});

it('can delete an attachment', function () {
    Storage::fake('public');

    $attachment = $this->task->attachments()->create([
        'user_id' => $this->owner->id,
        'original_name' => 'test.pdf',
        'file_path' => 'attachments/test.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
    ]);

    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/attachments/{$attachment->id}");

    $response->assertStatus(200);
    $this->assertDatabaseMissing('attachments', ['id' => $attachment->id]);
});

// =============================================
// ACTIVITY LOG — Happy Path + Verification
// =============================================

it('automatically logs task creation via Observer', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
        'title' => 'Logged Task',
        'column_id' => $this->column->id,
    ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'task.created',
        'user_id' => $this->owner->id,
    ]);
});

it('automatically logs task update via Observer', function () {
    $response = $this->actingAs($this->owner)->putJson("/api/v1/tasks/{$this->task->id}", [
        'title' => 'Updated Title',
        'column_id' => $this->column->id,
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'task.updated',
        'user_id' => $this->owner->id,
    ]);
});

it('automatically logs task deletion via Observer', function () {
    $response = $this->actingAs($this->owner)->deleteJson("/api/v1/tasks/{$this->task->id}");

    $response->assertStatus(200);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'task.deleted',
        'user_id' => $this->owner->id,
    ]);
});

it('logs task move across columns manually', function () {
    $newColumn = Column::factory()->create(['board_id' => $this->board->id]);

    $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/move", [
        'column_id' => $newColumn->id,
        'position' => 0,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'task.moved',
        'user_id' => $this->owner->id,
    ]);
});

it('logs task assignment manually', function () {
    $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/assign", [
        'user_id' => $this->member->id,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'task.assigned',
        'user_id' => $this->owner->id,
    ]);
});

it('logs task unassignment manually', function () {
    // First assign
    $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/assign", [
        'user_id' => $this->member->id,
    ]);

    // Then unassign
    $this->actingAs($this->owner)->deleteJson("/api/v1/tasks/{$this->task->id}/assign/{$this->member->id}");

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'task.unassigned',
    ]);
});

it('logs comment creation via Observer', function () {
    $this->actingAs($this->member)->postJson("/api/v1/tasks/{$this->task->id}/comments", [
        'content' => 'Great progress!',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'comment.created',
        'user_id' => $this->member->id,
    ]);
});

it('logs comment deletion via Observer', function () {
    $comment = Comment::factory()->create([
        'task_id' => $this->task->id,
        'user_id' => $this->member->id,
    ]);

    $this->actingAs($this->member)->deleteJson("/api/v1/comments/{$comment->id}");

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'comment.deleted',
    ]);
});

it('logs column creation', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/boards/{$this->board->id}/columns", [
        'name' => 'QA Column',
        'color' => '#22c55e',
    ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('activity_logs', [
        'project_id' => $this->project->id,
        'action' => 'column.created',
    ]);
});

it('can view paginated activity log for a project', function () {
    // Trigger multiple actions
    $this->actingAs($this->owner)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
        'title' => 'Activity Test 1',
        'column_id' => $this->column->id,
    ]);
    $this->actingAs($this->owner)->postJson("/api/v1/projects/{$this->project->id}/tasks", [
        'title' => 'Activity Test 2',
        'column_id' => $this->column->id,
    ]);

    $response = $this->actingAs($this->owner)->getJson("/api/v1/projects/{$this->project->id}/activity");

    $response->assertStatus(200);
    $data = $response->json('data');
    expect(count($data['data']))->toBeGreaterThanOrEqual(2);
});

// =============================================
// EDGE CASES — Checklists
// =============================================

it('prevents an outsider from accessing checklists', function () {
    $response = $this->actingAs($this->outsider)->getJson("/api/v1/tasks/{$this->task->id}/checklists");
    $response->assertStatus(403);
});

it('prevents an outsider from creating a checklist', function () {
    $response = $this->actingAs($this->outsider)->postJson("/api/v1/tasks/{$this->task->id}/checklists", [
        'title' => 'Hacked',
    ]);
    $response->assertStatus(403);
});

it('fails to create a checklist without a title', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/checklists", []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});

it('fails to create a checklist item without content', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);

    $response = $this->actingAs($this->owner)->postJson("/api/v1/checklists/{$checklist->id}/items", []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['content']);
});

it('prevents an outsider from toggling a checklist item', function () {
    $checklist = Checklist::factory()->create(['task_id' => $this->task->id]);
    $item = ChecklistItem::factory()->create(['checklist_id' => $checklist->id]);

    $response = $this->actingAs($this->outsider)->putJson("/api/v1/checklist-items/{$item->id}/toggle");
    $response->assertStatus(403);
});

// =============================================
// EDGE CASES — Comments
// =============================================

it('prevents an outsider from commenting on a task', function () {
    $response = $this->actingAs($this->outsider)->postJson("/api/v1/tasks/{$this->task->id}/comments", [
        'content' => 'Hacked comment',
    ]);
    $response->assertStatus(403);
});

it('prevents a member from deleting someone elses comment', function () {
    $comment = Comment::factory()->create([
        'task_id' => $this->task->id,
        'user_id' => $this->owner->id,
    ]);

    $response = $this->actingAs($this->member)->deleteJson("/api/v1/comments/{$comment->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('comments', ['id' => $comment->id]);
});

it('fails to create a comment without content', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/comments", []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['content']);
});

it('prevents an outsider from viewing comments', function () {
    $response = $this->actingAs($this->outsider)->getJson("/api/v1/tasks/{$this->task->id}/comments");
    $response->assertStatus(403);
});

// =============================================
// EDGE CASES — Attachments
// =============================================

it('prevents an outsider from uploading attachments', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('hack.pdf', 500, 'application/pdf');

    $response = $this->actingAs($this->outsider)->postJson("/api/v1/tasks/{$this->task->id}/attachments", [
        'file' => $file,
    ]);
    $response->assertStatus(403);
});

it('fails to upload without a file', function () {
    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/attachments", []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['file']);
});

it('rejects file exceeding max size', function () {
    Storage::fake('public');

    // 11MB = exceeds 10MB limit (10240KB)
    $file = UploadedFile::fake()->create('huge.pdf', 11000, 'application/pdf');

    $response = $this->actingAs($this->owner)->postJson("/api/v1/tasks/{$this->task->id}/attachments", [
        'file' => $file,
    ]);

    $response->assertStatus(422);
});

it('prevents outsider from viewing attachments', function () {
    $response = $this->actingAs($this->outsider)->getJson("/api/v1/tasks/{$this->task->id}/attachments");
    $response->assertStatus(403);
});

// =============================================
// EDGE CASES — Activity Log
// =============================================

it('prevents an outsider from viewing activity log', function () {
    $response = $this->actingAs($this->outsider)->getJson("/api/v1/projects/{$this->project->id}/activity");
    $response->assertStatus(403);
});

it('requires authentication to view activity log', function () {
    $response = $this->getJson("/api/v1/projects/{$this->project->id}/activity");
    $response->assertStatus(401);
});
