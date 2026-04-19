# 📏 ProFlow — Project Rules & Conventions

> **File này là BẮT BUỘC cho mọi AI agent** khi làm việc trên dự án ProFlow.
> Đọc file này TRƯỚC KHI viết bất kỳ dòng code nào.
> Áp dụng cho cả MVP lẫn Production.

---

## 1. Context Files — Đọc trước khi làm

| Thứ tự | File | Khi nào đọc |
|---|---|---|
| 1️⃣ | `context/rules/project_rules.md` | **LUÔN LUÔN** — file này |
| 2️⃣ | `context/docs_reference.md` | Khi code tech 🔴🟡 (Laravel 13, Vite 8, etc.) |
| 3️⃣ | `context/tech_stack.md` | Khi cài đặt / cấu hình dependencies |
| 4️⃣ | `context/mvp/mvp_specification.md` | Khi cần hiểu scope features |
| 5️⃣ | `context/mvp/task_checklist.md` | Khi cần biết đang làm task nào |
| 6️⃣ | `context/project_specification.md` | Khi cần DB schema, API endpoints, full vision |

---

## 2. Tech Stack — Phiên bản KHÔNG được thay đổi

```
PHP 8.4  |  Laravel 13  |  MySQL 8.4 LTS  |  Sanctum 4
React 19  |  React Router 7  |  Zustand 5  |  Vite 8
Pest 4   |  Laravel Pint  |  Axios ≥1.15.0
Docker: php:8.4-fpm, nginx:1.30-alpine, mysql:8.4
```

> **KHÔNG được** thay đổi phiên bản mà không có sự đồng ý của user.
> Tham chiếu chi tiết: `context/tech_stack.md`

---

## 3. Architecture Rules

### 3.1 Layered Architecture (BẮT BUỘC)

```
Request → Controller → Service → Model → Database
```

| Layer | Trách nhiệm | KHÔNG ĐƯỢC làm |
|---|---|---|
| **Controller** | Nhận request, gọi Service, trả Resource | ❌ Business logic, ❌ Truy vấn DB trực tiếp, ❌ Validation |
| **FormRequest** | Validate input | ❌ Business logic, ❌ Authorization (dùng Policy) |
| **Service** | Business logic | ❌ Return HTTP response, ❌ Access Request object |
| **Policy** | Authorization (ai được làm gì) | ❌ Business logic |
| **Observer** | Side effects (activity log) | ❌ Business logic, ❌ Throw exceptions |
| **Resource** | Format JSON response | ❌ Business logic, ❌ Truy vấn DB |
| **Model** | Relationships, Scopes, Accessors | ❌ Business logic phức tạp |
| **Enum** | Định nghĩa constants có type | ❌ Business logic |
| **DTO** | Data transfer giữa layers | ❌ Business logic, ❌ Truy vấn DB |

### 3.2 Controller phải Thin (BẮT BUỘC)

```php
// ✅ ĐÚNG — Controller mỏng
public function store(StoreTaskRequest $request): JsonResponse
{
    $task = $this->taskService->createTask(
        TaskDTO::fromRequest($request)
    );

    return $this->success(
        new TaskResource($task),
        'Task created successfully',
        201
    );
}

// ❌ SAI — Controller có logic
public function store(Request $request): JsonResponse
{
    $request->validate([...]); // ❌ Dùng FormRequest
    
    if ($request->user()->role !== 'admin') { // ❌ Dùng Policy
        abort(403);
    }
    
    $task = new Task(); // ❌ Dùng Service
    $task->title = $request->title;
    $task->position = Task::where('column_id', $request->column_id)->max('position') + 1; // ❌ Logic trong Service
    $task->save();
    
    ActivityLog::create([...]); // ❌ Dùng Observer
    
    return response()->json($task); // ❌ Dùng Resource + ApiResponse
}
```

### 3.3 KHÔNG dùng Repository Pattern trong MVP

Gọi Eloquent trực tiếp trong Service là được. Nếu cần Repository, đợi Production phase.

---

## 4. Coding Standards (PHP)

### 4.1 Code Style: PSR-12 (via Laravel Pint)

```bash
# Chạy trước mỗi commit
./vendor/bin/pint
```

### 4.2 PHP 8.4 Features — SỬ DỤNG

```php
// ✅ Enums (BẮT BUỘC cho mọi constants)
enum TaskPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Urgent = 'urgent';
}

// ✅ Named Arguments (khi nhiều params)
ActivityLogService::log(
    user: $user,
    project: $project,
    loggable: $task,
    action: 'task.created',
);

// ✅ Match expressions (thay cho switch)
$color = match($priority) {
    TaskPriority::Low => '#22c55e',
    TaskPriority::Urgent => '#ef4444',
    default => '#64748b',
};

// ✅ Readonly properties (khi applicable)
readonly class TaskDTO
{
    public function __construct(
        public string $title,
        public ?string $description,
        public TaskPriority $priority,
    ) {}
}

// ✅ Null safe operator
$task->assignee?->name;
```

### 4.3 PHP — KHÔNG được làm

```php
// ❌ Magic strings cho roles/status/priority
if ($member->role === 'admin') // ❌
if ($member->role === ProjectRole::Admin) // ✅

// ❌ Array thay cho typed objects
$data = ['title' => 'foo', 'priority' => 'high']; // ❌
$dto = new TaskDTO(title: 'foo', priority: TaskPriority::High); // ✅

// ❌ Check role thủ công
if ($user->id === $project->owner_id || $user->role === 'admin') // ❌
$this->authorize('update', $project); // ✅ Dùng Policy

// ❌ N+1 queries
$tasks = Task::all();
foreach ($tasks as $task) { echo $task->assignees; } // ❌
$tasks = Task::with('assignees')->get(); // ✅ Eager loading

// ❌ Logic trong Controller (xem rule 3.2)

// ❌ Hardcode response format
return response()->json(['data' => $task]); // ❌
return $this->success(new TaskResource($task)); // ✅ ApiResponse trait
```

### 4.4 PHPDoc — Khi nào viết

```php
// ✅ VIẾT PHPDoc cho: Service methods (public API)
/**
 * Create a new task and assign it to the end of the column.
 *
 * @throws AuthorizationException
 */
public function createTask(TaskDTO $dto, User $user): Task
{
    // ...
}

// ❌ KHÔNG CẦN PHPDoc cho: obvious methods
public function getTitle(): string  // tên method đã rõ
{
    return $this->title;
}
```

---

## 5. Coding Standards (React / Frontend)

### 5.0 CSS: Tailwind CSS v4 (BẮT BUỘC)

```tsx
// ✅ ĐÚNG — Dùng Tailwind utility classes
<div className="flex items-center gap-2 rounded-lg bg-gray-900 p-4">
  <h3 className="text-sm font-semibold text-white">{title}</h3>
</div>

// ❌ SAI — Viết CSS thủ công trong .module.css
import styles from './Card.module.css'
<div className={styles.card}>{title}</div>
```

> **Quy tắc:**
> - Dùng Tailwind utility classes cho mọi styling
> - Custom design tokens đặt trong `app.css` qua `@theme`
> - Chỉ viết custom CSS khi Tailwind không hỗ trợ (animation phức tạp)
> - KHÔNG dùng CSS Modules

### 5.1 TypeScript + Functional Components + Hooks ONLY (BẮT BUỘC)

```tsx
// ✅ ĐÚNG — TypeScript Functional Component + Hooks
import { useState, useEffect, useMemo } from 'react'

interface TaskListProps {
  columnId: number
}

function TaskList({ columnId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks])

  useEffect(() => {
    fetchTasks(columnId)
  }, [columnId])

  return <div>{/* ... */}</div>
}

export default TaskList

// ❌ SAI — Class Component
class TaskList extends React.Component {
  state = { tasks: [] }
  componentDidMount() { ... }
  render() { return <div /> }
}

// ❌ SAI — Dùng `any` type
const data: any = response.data // ❌
const data: ApiResponse<Task> = response.data // ✅
```

### 5.2 Naming Conventions

| Loại | Convention | Ví dụ |
|---|---|---|
| **Components** | PascalCase `.tsx` | `TaskCard.tsx`, `KanbanBoard.tsx` |
| **Pages** | PascalCase + Page suffix `.tsx` | `LoginPage.tsx`, `BoardPage.tsx` |
| **Hooks** | camelCase + use prefix `.ts` | `useAuth.ts`, `useDragDrop.ts` |
| **Stores** | camelCase + Store suffix `.ts` | `authStore.ts`, `boardStore.ts` |
| **Services** | camelCase + Service suffix `.ts` | `authService.ts`, `taskService.ts` |
| **Types** | PascalCase, trong `types/` folder `.ts` | `types/task.ts`, `types/project.ts` |
| **CSS** | Tailwind CSS v4 utility classes | `className="flex items-center gap-2"` |
| **Callbacks** | on/handle prefix | `onClick`, `handleDragEnd` |
| **Props** | PascalCase + Props suffix (interface) | `TaskCardProps`, `BoardPageProps` |

### 5.3 Component Structure

```jsx
// Thứ tự trong .jsx file

// 1. Imports (React, libraries, components, hooks, styles)
import { useState, useEffect } from 'react'
import { useBoardStore } from '../stores/boardStore'
import styles from './TaskCard.module.css'

// 2. Component function
function TaskCard({ task, onEdit }) {
  // 3. Hooks (useState, useEffect, custom hooks, stores)
  const [isLoading, setIsLoading] = useState(false)
  const moveTask = useBoardStore((s) => s.moveTask)

  // 4. Derived state / Memos
  const isOverdue = useMemo(() => new Date(task.due_date) < new Date(), [task.due_date])

  // 5. Event handlers
  const handleClick = () => { onEdit(task.id) }

  // 6. Effects
  useEffect(() => { /* ... */ }, [])

  // 7. Render
  return (
    <div className={styles.card} onClick={handleClick}>
      {/* ... */}
    </div>
  )
}

export default TaskCard
```

### 5.4 State Management (Zustand)

```javascript
import { create } from 'zustand'
import { authService } from '../services/authService'

// ✅ ĐÚNG — Zustand store
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { data } = await authService.login(credentials)
    set({ user: data.user, isAuthenticated: true })
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false })
  },
}))

// ✅ ĐÚNG — Dùng trong component (chỉ select cần thiết)
function Profile() {
  const user = useAuthStore((state) => state.user) // ✅ selective
  return <div>{user?.name}</div>
}

// ❌ SAI — Select toàn bộ store (gây re-render không cần)
function Profile() {
  const store = useAuthStore() // ❌ re-render khi BẤT KỲ state nào thay đổi
}
```

### 5.5 API Calls — Qua Service Layer

```javascript
// ✅ ĐÚNG — Component gọi store, store gọi service
// Component:
const moveTask = useBoardStore((s) => s.moveTask)
await moveTask(taskId, columnId, position)

// Store:
moveTask: async (taskId, columnId, position) => {
  await taskService.moveTask(taskId, { column_id: columnId, position })
  // update local state via set()
}

// Service:
export const taskService = {
  moveTask: (id, data) => api.post(`/tasks/${id}/move`, data),
}

// ❌ SAI — Component gọi API trực tiếp
await axios.post(`/api/v1/tasks/${id}/move`, data) // ❌ trong component
```

---

## 6. API Rules

### 6.1 Versioning (BẮT BUỘC)

```
Tất cả API routes PHẢI có prefix: /api/v1/
```

### 6.2 Response Format (BẮT BUỘC — dùng ApiResponse Trait)

```json
// Success
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... },
  "meta": { "timestamp": "2026-04-17T12:00:00Z" }
}

// Error
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": { "title": ["The title field is required."] },
  "meta": { "timestamp": "2026-04-17T12:00:00Z" }
}

// Paginated
{
  "success": true,
  "data": [...],
  "meta": { "current_page": 1, "per_page": 20, "total": 150 }
}
```

### 6.3 HTTP Status Codes

| Code | Khi nào dùng |
|---|---|
| `200` | GET success, UPDATE success |
| `201` | POST success (resource created) |
| `204` | DELETE success (no content) |
| `400` | Bad request |
| `401` | Unauthorized (chưa login) |
| `403` | Forbidden (không có quyền) |
| `404` | Not found |
| `422` | Validation error |
| `500` | Server error |

### 6.4 Route Naming

```php
// ✅ RESTful resource routes
Route::apiResource('projects', ProjectController::class);

// ✅ Nested routes cho quan hệ cha-con
Route::post('projects/{project}/tasks', [TaskController::class, 'store']);
Route::post('tasks/{task}/move', [TaskController::class, 'move']);

// ❌ KHÔNG dùng verbs trong URL
Route::post('tasks/createTask', ...); // ❌
Route::post('tasks/deleteTask/{id}', ...); // ❌
```

---

## 7. Database Rules

### 7.1 Migration

```php
// ✅ Luôn dùng enum values từ PHP Enum
$table->enum('priority', array_column(TaskPriority::cases(), 'value'));

// ✅ Luôn có index cho foreign keys và columns thường query
$table->index('column_id');
$table->index('status');

// ✅ Luôn có timestamps
$table->timestamps();

// ❌ KHÔNG sửa migration cũ, tạo migration mới
```

### 7.2 Eloquent Model

```php
// ✅ BẮT BUỘC: $fillable (mass assignment protection)
protected $fillable = ['title', 'priority', 'column_id'];

// ✅ BẮT BUỘC: $casts (cho enum, date, json, boolean)
protected $casts = [
    'priority' => TaskPriority::class,
    'status' => TaskStatus::class,
    'due_date' => 'date',
    'is_archived' => 'boolean',
    'changes' => 'array',
];

// ✅ BẮT BUỘC: Relationships phải khai báo đầy đủ với return type
public function project(): BelongsTo
{
    return $this->belongsTo(Project::class);
}

// ❌ KHÔNG query trong Model (dùng Service)
```

### 7.3 Eager Loading (BẮT BUỘC)

```php
// ✅ LUÔN eager load khi cần relationships
$board = Board::with(['columns.tasks.assignees', 'columns.tasks.labels'])->findOrFail($id);

// ❌ KHÔNG để N+1 xảy ra
$board = Board::findOrFail($id);
foreach ($board->columns as $col) {
    foreach ($col->tasks as $task) {
        echo $task->assignees; // ❌ N+1 query
    }
}
```

---

## 8. Git Rules

### 8.1 Commit Format: Conventional Commits (BẮT BUỘC)

```
<type>: <description>

Types:
  feat:     Tính năng mới
  fix:      Sửa bug
  refactor: Refactor code (không thay đổi behavior)
  test:     Thêm/sửa tests
  docs:     Documentation
  chore:    Config, dependencies, build
  style:    Code style (format, spacing)
```

**Ví dụ:**
```
feat: add task drag and drop between columns
fix: resolve N+1 query on board loading
refactor: extract activity logging to observer
test: add feature tests for task CRUD
docs: update README with installation guide
chore: upgrade laravel/sanctum to 4.3
```

### 8.2 Branch Strategy

```
main        ← Production-ready code
  └── develop    ← Integration branch
        ├── feature/auth-system
        ├── feature/kanban-board
        ├── feature/activity-log
        └── fix/task-move-position
```

### 8.3 KHÔNG commit

```gitignore
# Đã có trong .gitignore, nhưng cẩn thận:
vendor/
node_modules/
.env                 # ← KHÔNG BAO GIỜ commit file .env
storage/app/public/  # ← User uploads
```

---

## 9. File Organization

### 9.1 Mỗi Class 1 File (BẮT BUỘC)

```
❌ KHÔNG gộp nhiều class vào 1 file
❌ KHÔNG tạo file God class (>300 dòng)
✅ Tách nhỏ, mỗi class có 1 trách nhiệm
```

### 9.2 Namespace theo Folder Structure

```php
// File path → Namespace
app/Services/TaskService.php         → App\Services\TaskService
app/Http/Controllers/Api/V1/...      → App\Http\Controllers\Api\V1\...
app/Enums/TaskPriority.php           → App\Enums\TaskPriority
app/DTOs/TaskDTO.php                 → App\DTOs\TaskDTO
```

### 9.3 Import Order

```php
// PHP/Laravel imports trước, app imports sau
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\DTOs\TaskDTO;
use App\Services\TaskService;
```

---

## 10. Security Rules

```php
// ✅ BẮT BUỘC: Validate input qua FormRequest
// ✅ BẮT BUỘC: Authorize qua Policy
// ✅ BẮT BUỘC: Mass assignment protection ($fillable)
// ✅ BẮT BUỘC: Parameterized queries (Eloquent mặc định đã an toàn)

// ❌ KHÔNG raw SQL mà không bind params
DB::select("SELECT * FROM users WHERE id = $id"); // ❌ SQL Injection
DB::select("SELECT * FROM users WHERE id = ?", [$id]); // ✅

// ❌ KHÔNG expose sensitive data trong API response
// UserResource KHÔNG trả về: password, remember_token
// Error response KHÔNG trả về: stack trace (production)
```

---

## 11. Testing Rules

```php
// ✅ Test name mô tả hành vi, không phải method name
it('creates a task with valid data', function () { ... }); // ✅
it('test_store_method', function () { ... }); // ❌

// ✅ Mỗi test độc lập, dùng RefreshDatabase
uses(RefreshDatabase::class);

// ✅ Dùng Factory để tạo test data
$user = User::factory()->create();

// ✅ Assert cả status code VÀ response structure
$response->assertStatus(201)
         ->assertJsonStructure(['success', 'data' => ['id', 'title']]);
```

---

## 12. Activity Log Rules

```php
// ✅ Dùng Observer cho model events (created, updated, deleted)
// ✅ Dùng manual logging trong Service cho custom actions (moved, assigned)
// ✅ Luôn có human-readable description
// ✅ Luôn ghi project_id (để filter theo project)
// ✅ JSON changes ghi cả old + new values

// ❌ KHÔNG log trong Controller
// ❌ KHÔNG log sensitive data (passwords, tokens)
// ❌ KHÔNG log read operations (chỉ log writes)
```

---

## 13. UI/UX Rules

### 13.1 Dark Theme Default

```css
:root {
  --bg-primary: #0f172a;      /* Dark Slate */
  --bg-surface: #1e293b;      /* Slate 800 */
  --bg-elevated: #334155;     /* Slate 700 */
  --text-primary: #f8fafc;    /* Slate 50 */
  --text-secondary: #94a3b8;  /* Slate 400 */
  --accent: #6366f1;          /* Indigo */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --font-family: 'Inter', sans-serif;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### 13.2 Component Rules

```
✅ Dùng CSS Variables cho colors/spacing (KHÔNG hardcode)
✅ CSS Modules cho component-scoped styles (.module.css)
✅ Responsive: mobile-friendly
✅ Loading states cho mọi async operation
✅ Error states cho mọi API call
✅ Empty states khi không có data
✅ Hover effects trên interactive elements
✅ Smooth transitions (150-300ms)

❌ KHÔNG dùng inline styles
❌ KHÔNG dùng !important
❌ KHÔNG dùng TailwindCSS (trừ khi user yêu cầu)
```

---

## 14. Performance Rules

```php
// ✅ Eager loading cho relationships (xem rule 7.3)
// ✅ Pagination cho list endpoints (20 items/page)
// ✅ Database indexes cho columns thường query
// ✅ Select only needed columns khi applicable

// ❌ KHÔNG load toàn bộ records không paginate
// ❌ KHÔNG query trong loop (N+1)
// ❌ KHÔNG return quá nhiều data trong API response
```

---

## 15. Error Handling Rules

```php
// ✅ Global Exception Handler format mọi error thành ApiResponse
// ✅ Specific exceptions cho specific cases
// ✅ Log errors nhưng KHÔNG expose stack trace cho client

// Controller KHÔNG try-catch (để Global Handler xử lý)
// Service CÓ THỂ throw custom exceptions khi cần
```
