# 🎯 ProFlow MVP — Minimum Viable Product Specification

> **Tài liệu này là bản MVP được rút gọn từ** [project_specification.md](file:///d:/workplace/php/eprojects/context/project_specification.md)
> **Nguyên tắc:** Làm ÍT nhưng HOÀN CHỈNH, code cực sạch — mỗi feature phải "production-ready" về chất lượng.
> **Sau khi MVP hoàn thành** → nâng cấp lên bản Production theo spec gốc.

---

## 📌 MVP vs PRODUCTION — Scope Boundary

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │                                                  │   │
│   │   ┌──────────────────────────────────────────┐   │   │
│   │   │            🟢 MVP (3 tuần)               │   │   │
│   │   │  Auth, CRUD, Kanban, Comments,           │   │   │
│   │   │  RBAC, Activity Log, Basic Search        │   │   │
│   │   └──────────────────────────────────────────┘   │   │
│   │              🟡 ENHANCED (tuần 4-5)              │   │
│   │  Real-time WebSocket, Notifications,             │   │
│   │  Dashboard Analytics, Tests, API Docs            │   │
│   └──────────────────────────────────────────────────┘   │
│                🔴 PRODUCTION (stretch goals)              │
│  @Mentions, Reactions, Calendar, Bulk Actions,           │
│  Saved Filters, Weekly Reports, Online Presence          │
└──────────────────────────────────────────────────────────┘
```

| Tiêu chí | 🟢 MVP | 🟡 Enhanced | 🔴 Production |
|---|---|---|---|
| **Thời gian** | Tuần 1-3 | Tuần 4-5 | Stretch goals |
| **Mục tiêu** | Chạy được, code sạch | Gây ấn tượng mạnh | Feature-complete |
| **Features** | ~30 | ~50 | 70+ |
| **Testing** | Manual + vài Feature tests | ~60% coverage | 80%+ |
| **Real-time** | ❌ (chuẩn bị sẵn Events) | ✅ WebSocket | ✅ + Presence |
| **Dashboard** | Basic stats (số liệu thô) | Charts (Chart.js) | Calendar + Reports |
| **Notifications** | Database only | + Real-time broadcast | + Email + Preferences |

---

## 🏗️ MVP TECH STACK (Đã giản lược)

| Layer | Công nghệ | Ghi chú MVP |
|---|---|---|
| **Backend** | PHP 8.2 + Laravel 11 | Giữ nguyên |
| **Frontend** | React 19 + Hooks | Giữ nguyên |
| **State** | Zustand 5 | Giữ nguyên |
| **Database** | MySQL 8 | Giữ nguyên |
| **Cache** | File-based (Laravel default) | ⚡ Bỏ Redis cho MVP, dùng file cache |
| **Queue** | Sync driver | ⚡ Bỏ Redis queue, chạy sync |
| **Auth** | Laravel Sanctum | Giữ nguyên |
| **DevOps** | Docker + Docker Compose | Giản lược: app + nginx + mysql |
| **Real-time** | ❌ Bỏ trong MVP | Thêm ở Enhanced phase |
| **Search** | MySQL LIKE + FULLTEXT | ⚡ Bỏ Scout, dùng native MySQL |
| **API Docs** | ❌ Bỏ trong MVP | Thêm ở Enhanced phase |
| **Testing** | Pest PHP (basic) | Viết test cho critical flows |
| **Code Quality** | Laravel Pint | ⚡ Bỏ PHPStan cho MVP |

### Docker Compose (MVP - 3 services)

```yaml
services:
  app:     # PHP 8.2-FPM + Laravel
  nginx:   # Nginx reverse proxy
  mysql:   # MySQL 8.0
```

> Enhanced phase sẽ thêm: `redis`, `reverb`, `queue`, `scheduler`

---

## 📊 MVP DATABASE SCHEMA (Giữ nguyên Production)

> **Quan trọng:** Database schema giữ **NGUYÊN TOÀN BỘ** như bản Production.
> Lý do: Migration chạy 1 lần, không muốn phải alter table sau.
> Các bảng không dùng trong MVP sẽ đơn giản là chưa có data.

### Bảng DÙNG trong MVP (10 bảng)

| Bảng | Dùng trong MVP | Ghi chú |
|---|---|---|
| `users` | ✅ Full | - |
| `projects` | ✅ Full | - |
| `project_members` | ✅ Full | - |
| `boards` | ✅ Simplified | Mỗi project chỉ tạo 1 default board |
| `columns` | ✅ Full | Bỏ WIP limit logic trong MVP |
| `tasks` | ✅ Core fields | Bỏ `cover_image`, `estimated_hours`, `actual_hours` logic |
| `task_assignments` | ✅ Full | - |
| `labels` | ✅ Full | - |
| `task_labels` | ✅ Full | - |
| `comments` | ✅ Basic | Bỏ `parent_id` (no threaded), bỏ `is_edited` logic |
| `checklists` | ✅ Full | - |
| `checklist_items` | ✅ Full | - |
| `attachments` | ✅ Basic | Chỉ upload/download, bỏ preview |
| `activity_logs` | ✅ Full | **Giữ lại — điểm cộng lớn** |
| `notifications` | ✅ Database only | Chưa broadcast, chỉ ghi DB |
| `invitations` | ❌ Bỏ trong MVP | Thêm member trực tiếp bằng email (user đã tồn tại) |

### Schema SQL: Tham chiếu → [project_specification.md](file:///d:/workplace/php/eprojects/context/project_specification.md) mục DATABASE SCHEMA

> Tạo ALL migrations ngay từ đầu, kể cả bảng chưa dùng. Đây là best practice.

---

## 🎯 MVP FEATURES — 7 Epics, ~30 Features

### Epic 1: Authentication (5 features)

> **Mục tiêu:** Login/Register hoạt động, Sanctum SPA auth, cơ bản nhưng chắc chắn.

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 1.1 | Đăng ký | Email + Password + Name | `POST /api/v1/auth/register` |
| 1.2 | Đăng nhập | Email/Password, Sanctum cookie | `POST /api/v1/auth/login` |
| 1.3 | Đăng xuất | Revoke token | `POST /api/v1/auth/logout` |
| 1.4 | Get Current User | Lấy thông tin user đang đăng nhập | `GET /api/v1/auth/user` |
| 1.5 | Update Profile | Update name, avatar upload | `PUT /api/v1/auth/profile` |

**Bỏ trong MVP:** Quên mật khẩu, Đổi mật khẩu, Email verification, Online status

**Kỹ năng thể hiện:**
- `FormRequest` validation (RegisterRequest, LoginRequest)
- `Sanctum` SPA auth (cookie-based, CSRF)
- `FileUploadService` cho avatar
- `UserResource` cho response transformation

---

### Epic 2: Project Management (7 features)

> **Mục tiêu:** CRUD Project + Member management với RBAC đầy đủ.

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 2.1 | List Projects | Danh sách projects của user (member/owner) | `GET /api/v1/projects` |
| 2.2 | Create Project | Tạo project mới (auto tạo default board + 4 columns) | `POST /api/v1/projects` |
| 2.3 | View Project | Chi tiết project + members | `GET /api/v1/projects/{id}` |
| 2.4 | Update Project | Update name, description, color | `PUT /api/v1/projects/{id}` |
| 2.5 | Delete Project | Soft delete (is_archived) | `DELETE /api/v1/projects/{id}` |
| 2.6 | Add Member | Thêm member bằng email (user đã tồn tại) + chọn role | `POST /api/v1/projects/{id}/members` |
| 2.7 | Remove Member | Remove member khỏi project | `DELETE /api/v1/projects/{id}/members/{userId}` |

**Bỏ trong MVP:** Invitation (email link), Archive/Restore, Star/Favorite, Project Settings page

**Kỹ năng thể hiện:**
- `ProjectPolicy` — Authorization (Owner/Admin/Member/Viewer)
- `ProjectService` + `ProjectRepository` — Service Layer pattern
- Auto-create default board khi tạo project — Business logic in Service
- `ProjectResource` — Consistent response format
- `Enum ProjectRole` — PHP 8.1 Enum
- `Enum ProjectVisibility` — PHP 8.1 Enum

**Authorization Rules (MVP):**

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View Project | ✅ | ✅ | ✅ | ✅ |
| Edit Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |
| Add Member | ✅ | ✅ | ❌ | ❌ |
| Remove Member | ✅ | ✅* | ❌ | ❌ |

---

### Epic 3: Board & Column (5 features)

> **Mục tiêu:** Columns hiển thị trên Kanban, cho phép CRUD + reorder.

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 3.1 | View Board | Lấy board + columns + tasks (nested) | `GET /api/v1/boards/{id}` |
| 3.2 | Create Column | Thêm column mới vào board | `POST /api/v1/boards/{id}/columns` |
| 3.3 | Update Column | Rename, change color | `PUT /api/v1/columns/{id}` |
| 3.4 | Delete Column | Xóa column (chuyển tasks sang column khác trước) | `DELETE /api/v1/columns/{id}` |
| 3.5 | Reorder Columns | Kéo thả thay đổi vị trí columns | `PUT /api/v1/boards/{id}/columns/reorder` |

**Bỏ trong MVP:** Multi-board (mỗi project chỉ 1 default board), WIP Limit, Done Column flag

**Thiết kế quan trọng — Default Board:**
Khi tạo project, auto tạo 1 board "Main Board" với 4 columns:
1. `To Do` (position: 0, color: #64748b)
2. `In Progress` (position: 1, color: #3b82f6)
3. `Review` (position: 2, color: #f59e0b)  
4. `Done` (position: 3, color: #22c55e)

**Kỹ năng thể hiện:**
- Position ordering algorithm (gap strategy hoặc re-index)
- Nested eager loading: Board → Columns → Tasks (N+1 prevention)
- `BoardPolicy` authorization

---

### Epic 4: Task Management ⭐ (10 features)

> **Mục tiêu:** Core của ứng dụng. Drag & Drop Kanban, Task Detail Modal đầy đủ.
> **Đây là phần nhà tuyển dụng sẽ nhìn NHIỀU NHẤT.**

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 4.1 | Create Task | Quick add (chỉ title) ở cuối column | `POST /api/v1/projects/{id}/tasks` |
| 4.2 | View Task Detail | Modal hiển thị full thông tin task | `GET /api/v1/tasks/{id}` |
| 4.3 | Update Task | Update title, description (Markdown), priority, type, due_date | `PUT /api/v1/tasks/{id}` |
| 4.4 | Delete Task | Xóa task | `DELETE /api/v1/tasks/{id}` |
| 4.5 | Move Task | Kéo thả giữa columns, cập nhật position + column_id | `POST /api/v1/tasks/{id}/move` |
| 4.6 | Assign Members | Assign 1 hoặc nhiều members vào task | `POST /api/v1/tasks/{id}/assign` |
| 4.7 | Unassign Member | Remove member khỏi task | `DELETE /api/v1/tasks/{id}/assign/{userId}` |
| 4.8 | Manage Labels | Attach/Detach labels cho task | `POST/DELETE /api/v1/tasks/{id}/labels` |
| 4.9 | Checklists | CRUD Checklist + Checklist Items + Toggle completion | `CRUD /api/v1/tasks/{id}/checklists` |
| 4.10 | Filter Tasks | Filter by priority, assignee, label (trên Kanban board) | Query params trên board endpoint |

**Bỏ trong MVP:** Cover image, Time tracking (estimated/actual hours), Archive, Bulk Actions, Task Type filter

**Kỹ năng thể hiện:**
- `TaskService` + `TaskRepository` + `MoveTaskAction` — Layered architecture
- `TaskDTO` — Data Transfer Object pattern
- `TaskPolicy` — Fine-grained authorization
- `Enum TaskPriority`, `Enum TaskType`, `Enum TaskStatus` — PHP 8.1 Enums
- `StoreTaskRequest`, `UpdateTaskRequest`, `MoveTaskRequest` — Form Request validation
- `TaskResource` — API Resource with conditional relationships
- Position recalculation algorithm khi move
- Eloquent Relationships: belongsTo, hasMany, belongsToMany (labels), morphMany (attachments)
- **Drag & Drop UI** (React + @dnd-kit)

**Task Card hiển thị trên Kanban:**
```
┌─────────────────────────────┐
│ 🟠 Feature                  │  ← Task Type badge
│                             │
│ Setup authentication system │  ← Title
│                             │
│ 🔴 Urgent    📅 Apr 20      │  ← Priority + Due date
│                             │
│ [Backend] [API]             │  ← Label chips
│                             │
│ ☑ 3/5    👤 HA  👤 BN       │  ← Checklist progress + Assignee avatars
└─────────────────────────────┘
```

---

### Epic 5: Comments (3 features)

> **Mục tiêu:** Basic comments trên task — không threaded, không Markdown trong MVP.

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 5.1 | List Comments | Danh sách comments của task (mới nhất trước) | `GET /api/v1/tasks/{id}/comments` |
| 5.2 | Add Comment | Thêm comment vào task | `POST /api/v1/tasks/{id}/comments` |
| 5.3 | Delete Comment | Xóa comment (chỉ người viết hoặc admin) | `DELETE /api/v1/comments/{id}` |

**Bỏ trong MVP:** Edit comment, Threaded replies, Markdown, @Mentions, Real-time, Reactions

**Kỹ năng thể hiện:**
- `CommentPolicy` — Authorization (chỉ xóa comment mình viết)
- Comment triggers `ActivityLog` → Observer pattern
- Comment triggers `Notification` → tạo DB record cho task reporter

---

### Epic 6: Activity Log ⭐ (3 features)

> **Mục tiêu:** Audit trail tự động — ĐÂY LÀ ĐIỂM GHI ĐIỂM LỚN VỚI CÔNG TY NHẬT.
> Người Nhật coi trọng traceability. Mọi thao tác đều phải ghi lại.

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 6.1 | Auto Logging | Tự động ghi log khi task/comment/member thay đổi | Observer Pattern, không cần API |
| 6.2 | View Activity Feed | Timeline activities của project | `GET /api/v1/projects/{id}/activity` |
| 6.3 | Change Tracking | Ghi old/new values dưới dạng JSON | Stored trong `changes` column |

**Actions tracked trong MVP:**

```php
// Task events
'task.created'    → "{User} created task '{title}'"
'task.updated'    → "{User} updated {field} from '{old}' to '{new}'"
'task.moved'      → "{User} moved '{title}' from '{old_column}' to '{new_column}'"
'task.deleted'    → "{User} deleted task '{title}'"

// Assignment events
'task.assigned'   → "{User} assigned {Assignee} to '{title}'"
'task.unassigned' → "{User} unassigned {Assignee} from '{title}'"

// Comment events
'comment.created' → "{User} commented on '{task_title}'"
'comment.deleted' → "{User} deleted a comment on '{task_title}'"

// Member events
'member.added'    → "{User} added {Member} as {role}"
'member.removed'  → "{User} removed {Member}"

// Column events
'column.created'  → "{User} created column '{name}'"
'column.updated'  → "{User} renamed column from '{old}' to '{new}'"
'column.deleted'  → "{User} deleted column '{name}'"
```

**Implementation: Observer Pattern**

```php
// TaskObserver.php
class TaskObserver
{
    public function created(Task $task): void
    {
        ActivityLogService::log(
            user: auth()->user(),
            project: $task->project,
            loggable: $task,
            action: 'task.created',
            description: "created task '{$task->title}'"
        );
    }

    public function updated(Task $task): void
    {
        $changes = $task->getChanges();
        $original = $task->getOriginal();

        ActivityLogService::log(
            user: auth()->user(),
            project: $task->project,
            loggable: $task,
            action: 'task.updated',
            changes: ['old' => $original, 'new' => $changes],
            description: $this->buildDescription($changes)
        );
    }
}
```

**Kỹ năng thể hiện:**
- `Observer Pattern` — Decoupling activity logging from business logic
- `Polymorphic relationship` — loggable_type + loggable_id
- `JSON column` — storing old/new values diff
- Human-readable descriptions — UX quality
- `ActivityLogResource` — Formatted timeline data
- **Timeline UI** — Beautiful activity feed component

---

### Epic 7: File Attachments (3 features)

> **Mục tiêu:** Upload/Download files trên task — basic nhưng có.

| # | Feature | Mô tả | API Endpoint |
|---|---|---|---|
| 7.1 | Upload File | Upload file attachment vào task | `POST /api/v1/tasks/{id}/attachments` |
| 7.2 | List Attachments | Danh sách files của task | `GET /api/v1/tasks/{id}/attachments` |
| 7.3 | Delete Attachment | Xóa file (chỉ uploader hoặc admin) | `DELETE /api/v1/attachments/{id}` |

**Bỏ trong MVP:** Download endpoint (dùng direct URL), File preview, S3 storage

**Kỹ năng thể hiện:**
- `Polymorphic relationship` — attachable_type (Task, Comment)
- `FileUploadService` — File validation (type, size), unique naming
- `Laravel Storage` facade — Local disk abstraction
- Upload triggers `ActivityLog`

---

## 📁 MVP FOLDER STRUCTURE

```
proflow/
├── app/
│   ├── Enums/                          # ✅ Tạo hết ngay từ đầu
│   │   ├── TaskPriority.php
│   │   ├── TaskStatus.php
│   │   ├── TaskType.php
│   │   ├── ProjectRole.php
│   │   └── ProjectVisibility.php
│   │
│   ├── DTOs/                           # ✅ MVP
│   │   ├── TaskDTO.php
│   │   └── ProjectDTO.php
│   │
│   ├── Http/
│   │   ├── Controllers/Api/V1/         # ✅ MVP Controllers
│   │   │   ├── AuthController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── BoardController.php
│   │   │   ├── ColumnController.php
│   │   │   ├── TaskController.php
│   │   │   ├── CommentController.php
│   │   │   ├── AttachmentController.php
│   │   │   ├── LabelController.php
│   │   │   └── ActivityLogController.php
│   │   │
│   │   ├── Requests/                   # ✅ MVP Requests
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   ├── Project/
│   │   │   │   └── StoreProjectRequest.php
│   │   │   └── Task/
│   │   │       ├── StoreTaskRequest.php
│   │   │       ├── UpdateTaskRequest.php
│   │   │       └── MoveTaskRequest.php
│   │   │
│   │   ├── Resources/                  # ✅ MVP Resources
│   │   │   ├── UserResource.php
│   │   │   ├── ProjectResource.php
│   │   │   ├── BoardResource.php
│   │   │   ├── ColumnResource.php
│   │   │   ├── TaskResource.php
│   │   │   ├── CommentResource.php
│   │   │   ├── AttachmentResource.php
│   │   │   ├── LabelResource.php
│   │   │   └── ActivityLogResource.php
│   │   │
│   │   └── Middleware/
│   │       └── EnsureProjectMember.php # ✅ Middleware kiểm tra quyền project
│   │
│   ├── Models/                         # ✅ Tạo hết ngay từ đầu
│   │   ├── User.php
│   │   ├── Project.php
│   │   ├── ProjectMember.php
│   │   ├── Board.php
│   │   ├── Column.php
│   │   ├── Task.php
│   │   ├── TaskAssignment.php
│   │   ├── Label.php
│   │   ├── Checklist.php
│   │   ├── ChecklistItem.php
│   │   ├── Comment.php
│   │   ├── Attachment.php
│   │   ├── ActivityLog.php
│   │   └── Invitation.php             # Tạo model, chưa dùng trong MVP
│   │
│   ├── Observers/                      # ✅ MVP - Activity Log core
│   │   ├── TaskObserver.php
│   │   └── CommentObserver.php
│   │
│   ├── Policies/                       # ✅ MVP - Authorization
│   │   ├── ProjectPolicy.php
│   │   ├── TaskPolicy.php
│   │   └── CommentPolicy.php
│   │
│   ├── Services/                       # ✅ MVP Services
│   │   ├── TaskService.php
│   │   ├── ProjectService.php
│   │   ├── BoardService.php
│   │   ├── ActivityLogService.php
│   │   └── FileUploadService.php
│   │
│   └── Traits/
│       └── ApiResponse.php             # ✅ Consistent response format
│
├── database/
│   ├── migrations/                     # ✅ Tạo hết ALL tables (kể cả chưa dùng)
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── UserSeeder.php              # 5 demo users
│   │   ├── ProjectSeeder.php           # 2-3 demo projects
│   │   └── TaskSeeder.php              # 15-20 demo tasks
│   └── factories/
│       ├── UserFactory.php
│       ├── ProjectFactory.php
│       └── TaskFactory.php
│
├── routes/
│   └── api.php                         # ✅ RESTful routes, /api/v1/ prefix
│
├── tests/
│   └── Feature/
│       ├── Auth/
│       │   ├── LoginTest.php           # ✅ MVP
│       │   └── RegisterTest.php        # ✅ MVP
│       └── Task/
│           └── TaskCrudTest.php        # ✅ MVP
│
├── docker/
│   ├── php/Dockerfile
│   └── nginx/default.conf
│
├── docker-compose.yml
├── .env.example
└── README.md
```

### Frontend (MVP)

```
resources/
├── js/
│   ├── main.jsx                           # React entry point
│   ├── App.jsx                            # Root component
│   │
│   ├── router/index.jsx                   # React Router
│   │
│   ├── stores/                            # Zustand stores
│   │   ├── authStore.js
│   │   ├── projectStore.js
│   │   ├── boardStore.js
│   │   └── taskStore.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useDragDrop.js
│   │
│   ├── services/                          # API calls
│   │   ├── api.js                         # Axios instance + interceptors
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   └── taskService.js
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.jsx
│   │   │   ├── AppSidebar.jsx
│   │   │   ├── AppModal.jsx
│   │   │   ├── AppAvatar.jsx
│   │   │   ├── AppBadge.jsx
│   │   │   ├── AppToast.jsx
│   │   │   └── AppLoading.jsx
│   │   │
│   │   ├── board/
│   │   │   ├── KanbanBoard.jsx         # ⭐ Main board
│   │   │   ├── KanbanColumn.jsx        # ⭐ Column drop zone
│   │   │   └── TaskCard.jsx            # ⭐ Draggable card
│   │   │
│   │   ├── task/
│   │   │   ├── TaskDetailModal.jsx     # ⭐ Full detail view
│   │   │   ├── TaskChecklist.jsx
│   │   │   ├── TaskLabels.jsx
│   │   │   └── TaskAssignees.jsx
│   │   │
│   │   ├── comment/
│   │   │   ├── CommentList.jsx
│   │   │   └── CommentItem.jsx
│   │   │
│   │   ├── project/
│   │   │   ├── ProjectCard.jsx
│   │   │   └── MemberList.jsx
│   │   │
│   │   └── activity/
│   │       └── ActivityTimeline.jsx    # ⭐ Activity feed
│   │
│   └── pages/
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── ProjectListPage.jsx         # Dashboard + Projects
│       ├── BoardPage.jsx               # ⭐ Kanban Board page
│       └── NotFoundPage.jsx
│
├── css/
│   └── app.css
│
└── views/
    └── app.blade.php
```

---

## 🎨 MVP UI — Các Trang Cần Xây

### Trang 1: Login / Register Page
- Form login (email + password)
- Form register (name + email + password + confirm)
- Responsive, dark theme, professional look

### Trang 2: Project List Page (Dashboard)
- Sidebar: danh sách projects
- Content: Project cards grid (name, description, color, member count)
- Button "Create Project" → Modal form
- Hiển thị stats đơn giản: total tasks, completed tasks

### Trang 3: Board Page ⭐ (Main Page)
- Header: Project name + Members avatars + Settings
- Kanban Board: Columns + Task Cards
- Drag & Drop tasks giữa columns
- Click task → Open Task Detail Modal
- Quick add task ở cuối column
- Activity Timeline tab (sidebar hoặc panel)
- Basic filter bar: priority, assignee

### Trang 4: Task Detail Modal ⭐
Layout 2 cột:

```
┌────────────────────────────────────────────────────────────┐
│  ✕ Close                                          [Delete] │
├────────────────────────────────┬───────────────────────────┤
│                                │                           │
│  📝 Task Title (editable)      │  👥 Assignees             │
│                                │     [+ Add member]        │
│  📄 Description                │                           │
│     (Textarea/Markdown)        │  🏷️ Labels                │
│                                │     [+ Add label]         │
│  ☑ Checklists                  │                           │
│     [+ Add checklist]          │  📊 Priority: 🟠 High     │
│     ☐ Item 1                   │  📋 Type: Feature          │
│     ☑ Item 2                   │  📅 Due: Apr 20, 2026     │
│     ☐ Item 3                   │  📁 Column: In Progress   │
│                                │                           │
│  📎 Attachments                │                           │
│     file.pdf (120KB) [✕]       │                           │
│     [+ Upload file]            │                           │
│                                │                           │
│  💬 Comments                   │                           │
│     [Add comment...]           │                           │
│     ┌───────────────────┐      │                           │
│     │ User A • 2h ago   │      │                           │
│     │ Great progress!   │      │                           │
│     └───────────────────┘      │                           │
│                                │                           │
│  📜 Activity                   │                           │
│     • User A moved task...     │                           │
│     • User B assigned...       │                           │
│                                │                           │
└────────────────────────────────┴───────────────────────────┘
```

---

## 🔧 MVP API ENDPOINTS — DANH SÁCH ĐẦY ĐỦ

```
# ═══════════════════════ AUTH ═══════════════════════
POST   /api/v1/auth/register           # Đăng ký
POST   /api/v1/auth/login              # Đăng nhập
POST   /api/v1/auth/logout             # Đăng xuất
GET    /api/v1/auth/user               # Current user info
PUT    /api/v1/auth/profile            # Update profile
POST   /api/v1/auth/avatar             # Upload avatar

# ═══════════════════ PROJECTS ══════════════════════
GET    /api/v1/projects                # List my projects
POST   /api/v1/projects                # Create project
GET    /api/v1/projects/{id}           # Project detail
PUT    /api/v1/projects/{id}           # Update project
DELETE /api/v1/projects/{id}           # Delete project
GET    /api/v1/projects/{id}/members   # List members
POST   /api/v1/projects/{id}/members   # Add member (by email)
DELETE /api/v1/projects/{id}/members/{userId}  # Remove member
GET    /api/v1/projects/{id}/activity  # Activity timeline

# ═══════════════════ BOARDS ═══════════════════════
GET    /api/v1/projects/{id}/boards    # List boards (MVP: 1 board)
GET    /api/v1/boards/{id}             # Board + Columns + Tasks (nested)

# ═══════════════════ COLUMNS ══════════════════════
POST   /api/v1/boards/{id}/columns     # Create column
PUT    /api/v1/columns/{id}            # Update column
DELETE /api/v1/columns/{id}            # Delete column
PUT    /api/v1/boards/{id}/columns/reorder  # Reorder columns

# ═══════════════════ TASKS ════════════════════════
POST   /api/v1/projects/{id}/tasks     # Create task
GET    /api/v1/tasks/{id}              # Task detail (full)
PUT    /api/v1/tasks/{id}              # Update task
DELETE /api/v1/tasks/{id}              # Delete task
POST   /api/v1/tasks/{id}/move         # Move task (column + position)

# ═══════════════ TASK ASSIGNMENTS ═════════════════
POST   /api/v1/tasks/{id}/assign       # Assign member
DELETE /api/v1/tasks/{id}/assign/{userId}  # Unassign member

# ═══════════════════ LABELS ═══════════════════════
GET    /api/v1/projects/{id}/labels    # List project labels
POST   /api/v1/projects/{id}/labels    # Create label
PUT    /api/v1/labels/{id}             # Update label
DELETE /api/v1/labels/{id}             # Delete label
POST   /api/v1/tasks/{id}/labels       # Attach label to task
DELETE /api/v1/tasks/{id}/labels/{labelId}  # Detach label

# ═══════════════ CHECKLISTS ═══════════════════════
GET    /api/v1/tasks/{id}/checklists   # List checklists
POST   /api/v1/tasks/{id}/checklists   # Create checklist
PUT    /api/v1/checklists/{id}         # Update checklist title
DELETE /api/v1/checklists/{id}         # Delete checklist
POST   /api/v1/checklists/{id}/items   # Add checklist item
PUT    /api/v1/checklist-items/{id}    # Update item
DELETE /api/v1/checklist-items/{id}    # Delete item
PUT    /api/v1/checklist-items/{id}/toggle  # Toggle completion

# ═══════════════ COMMENTS ═════════════════════════
GET    /api/v1/tasks/{id}/comments     # List comments
POST   /api/v1/tasks/{id}/comments     # Add comment
DELETE /api/v1/comments/{id}           # Delete comment

# ═══════════════ ATTACHMENTS ══════════════════════
GET    /api/v1/tasks/{id}/attachments  # List attachments
POST   /api/v1/tasks/{id}/attachments  # Upload file
DELETE /api/v1/attachments/{id}        # Delete attachment

# ═══════════════ TOTAL: 38 ENDPOINTS ══════════════
```

---

## ⚡ MVP API RESPONSE FORMAT

Tham chiếu → [project_specification.md](file:///d:/workplace/php/eprojects/context/project_specification.md) mục API RESPONSE FORMAT

Giữ nguyên format từ Production spec: `{ success, message, data, meta }`

---

## 📅 MVP DEVELOPMENT PHASES & TASK CHECKLIST

> **Chi tiết TODO list đã được tách ra file riêng:**
> 📋 [task_checklist.md](file:///d:/workplace/php/eprojects/context/mvp/task_checklist.md)
>
> File checklist chứa ~150 tasks chi tiết, chia theo 6 phases + 7 epics, bao gồm:
> - Phase 1: Backend Foundation (Ngày 1-4)
> - Phase 2: Core Backend APIs (Ngày 5-8)
> - Phase 3: Advanced Backend (Ngày 9-11)
> - Phase 4: Frontend Foundation (Ngày 12-14)
> - Phase 5: Frontend Core Pages (Ngày 15-18)
> - Phase 6: Frontend Polish (Ngày 19-21)
> - MVP Definition of Done

---

## 🔄 POST-MVP: ENHANCED FEATURES (Tuần 4-5)

Sau khi MVP hoàn thành, upgrade từng phần theo thứ tự giá trị:

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 1️⃣ | **DevOps: GitHub Actions CI** | 1 ngày | ⭐⭐⭐ Professional signal |
| 2️⃣ | **Real-time Kanban** (Reverb WebSocket) | 2 ngày | ⭐⭐⭐ Impressive |
| 3️⃣ | **Dashboard Analytics** (Chart.js) | 1.5 ngày | ⭐⭐⭐ Visual WOW |
| 4️⃣ | **Full Test Suite** (~60% coverage) | 2 ngày | ⭐⭐ Quality signal |
| 5️⃣ | **Notification System** (DB + Real-time) | 2 ngày | ⭐⭐ Professional |
| 6️⃣ | **API Documentation** (Scribe) | 0.5 ngày | ⭐⭐ Professional |

### 🚀 DevOps Strategy: CI + Local Docker ($0)

> **Chiến lược:** GitHub Actions (CI miễn phí) + Docker local (demo). Không dùng cloud hosting, không tốn tiền.
> **Nếu sau này có thẻ Visa** → thêm Oracle Cloud Always Free (miễn phí vĩnh viễn) làm deployment target.

#### Pipeline Overview

```
Developer Push Code
       │
       ▼
┌──────────────────┐
│   GitHub Repo    │  Public repo → GitHub Actions FREE
│   (Source Code)  │
└───────┬──────────┘
        │ Push to any branch / Open PR
        ▼
┌──────────────────────────────────────────────┐
│              GitHub Actions CI                │
│                                              │
│  Job 1: Code Quality                         │
│  ├── Laravel Pint (PSR-12 code style)        │
│  └── Fail nếu code không đúng chuẩn         │
│                                              │
│  Job 2: Tests                                │
│  ├── Setup PHP 8.4 + MySQL                   │
│  ├── Composer install                        │
│  ├── Run migrations                          │
│  └── Run Pest tests → Fail nếu test fail    │
│                                              │
│  Job 3: Build                                │
│  ├── npm install                             │
│  ├── npm run build                           │
│  └── Verify build thành công                 │
└──────────────────────────────────────────────┘
        │
        ▼
   ✅ Green badge on README
   ❌ Red badge → fix code trước khi merge
```

#### CI Workflow File: `.github/workflows/ci.yml`

```yaml
name: ProFlow CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
      - name: Install dependencies
        run: composer install --no-interaction
      - name: Run Pint
        run: ./vendor/bin/pint --test

  tests:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.4
        env:
          MYSQL_DATABASE: proflow_test
          MYSQL_ROOT_PASSWORD: secret
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          extensions: pdo_mysql, mbstring, xml, zip
      - name: Install dependencies
        run: composer install --no-interaction
      - name: Setup env
        run: cp .env.ci .env
      - name: Run migrations
        run: php artisan migrate --force
      - name: Run tests
        run: ./vendor/bin/pest

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
```

#### Chi phí: $0

| Resource | Chi phí | Giới hạn |
|---|---|---|
| GitHub Actions (public repo) | **$0** | 2000 phút/tháng (đủ dùng) |
| Docker Desktop (local) | **$0** | Không giới hạn |
| GitHub repo (public) | **$0** | Không giới hạn |

#### Giá trị portfolio

```
✅ .github/workflows/ci.yml              → "Tôi biết CI/CD pipeline"
✅ Dockerfile + docker-compose.yml        → "Tôi biết Docker"
✅ README badge: CI Passing ✅            → Visual proof ngay trang chủ repo
✅ Tests tự động chạy mỗi push           → "Tôi viết automated tests"
✅ Code quality check tự động             → "Tôi quan tâm code standards"
```

#### Upgrade path (nếu có thẻ Visa sau này)

```
Hiện tại:  GitHub Actions CI → ✅ Pass → Done
Tương lai: GitHub Actions CI → ✅ Pass → CD: Deploy to Oracle Cloud (FREE forever)
```

---

## 📝 GHI CHÚ CHO AI ASSISTANT

> **Đây là MVP spec.** Khi phát triển, **LUÔN tham chiếu file này** trước.
> Production spec tại [project_specification.md](file:///d:/workplace/php/eprojects/context/project_specification.md)

### Nguyên tắc MVP:

1. **Mỗi feature phải hoàn chỉnh** — không code nửa vời rồi bỏ
2. **Quality > Quantity** — ít feature nhưng code sạch
3. **Database tạo hết ngay** — tránh alter table sau
4. **Enums + Models tạo hết ngay** — foundation phải solid
5. **API luôn versioned** `/api/v1/`
6. **Response luôn consistent** — dùng ApiResponse trait
7. **Service layer cho business logic** — controller phải thin
8. **FormRequest cho validation** — không validate trong controller
9. **Policy cho authorization** — không check role thủ công
10. **Observer cho activity log** — decoupled, automatic
11. **Bỏ Redis trong MVP** — dùng file cache, sync queue
12. **Bỏ WebSocket trong MVP** — nhưng chuẩn bị Events sẵn cho Enhanced phase
13. **Dark theme là default** — sáng tạo, hiện đại
