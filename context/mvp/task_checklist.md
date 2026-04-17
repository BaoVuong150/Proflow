# ✅ ProFlow MVP — Task Checklist

> **Tracking tiến độ MVP.** Cập nhật trạng thái khi hoàn thành từng task.
> `[ ]` chưa làm · `[/]` đang làm · `[x]` hoàn thành

---

## Phase 1: Backend Foundation (Ngày 1-4)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Xây dựng xong toàn bộ nền móng backend — database schema, models, relationships, enums, seeders — để **mọi API endpoint ở Phase 2 chỉ cần viết Controller + Service là chạy được ngay**, không cần quay lại sửa migration hay model.

### Epic 0: Project Scaffold & Infrastructure

#### 0.1 Git & Repository
- [x] `git init` + tạo `.gitignore` (Laravel default + custom rules)
- [ ] Tạo GitHub repository (public)
- [x] Setup branch strategy: `main` → `develop` → `feature/*`
- [ ] Push initial commit: `chore: initial project setup`
- [x] Tạo `README.md` (skeleton: project name, description, tech stack badge placeholder)
- [ ] Tạo `.editorconfig` (indent, charset, end_of_line)

#### 0.2 Laravel Scaffold
- [x] `composer create-project laravel/laravel proflow`
- [x] Cấu hình `.env.example`:
  - [x] MVP config: DB, App name, Sanctum, File cache, Sync queue
  - [x] 🔮 Production config (commented): Redis, Reverb, Mail, S3
- [x] Tạo `.env.ci` (GitHub Actions test environment)

#### 0.3 Docker Setup
- [x] `docker/php/Dockerfile` (PHP 8.4-FPM + extensions: pdo_mysql, gd, zip, bcmath, intl)
- [x] `docker/nginx/default.conf` (PHP-FPM upstream, SPA fallback)
- [x] `docker-compose.yml`:
  - [x] ✅ MVP services: `app` + `nginx` + `mysql`
  - [x] 🔮 Production services (commented): `redis`, `reverb`, `queue`, `scheduler`
- [x] `.dockerignore` (node_modules, .git, tests, vendor)
- [ ] Verify: `docker compose up -d` chạy thành công
- [ ] Verify: `docker compose exec app php artisan --version` trả về Laravel 13

#### 0.4 Frontend Setup
- [x] Cài frontend dependencies:
  - [x] ✅ MVP: React 19, React Router 7, Zustand 5, Axios ≥1.15.0, @dnd-kit/react
  - [ ] 🔮 Enhanced (chưa cài, note trong package.json): chart.js, react-chartjs-2, laravel-echo, pusher-js
- [x] Cấu hình `vite.config.js` + `@vitejs/plugin-react` + `laravel-vite-plugin`
- [x] Tạo `resources/views/app.blade.php` (SPA entry point + Vite directives)
- [ ] Verify: `npm run dev` chạy HMR thành công

#### 0.5 Backend Foundation
- [x] Cài dev tools:
  - [x] `laravel/pint` (code style)
  - [x] `pestphp/pest` + `pestphp/pest-plugin-laravel` (testing)
  - [x] `barryvdh/laravel-ide-helper` (IDE auto-complete)
  - [x] `barryvdh/laravel-debugbar` (debug toolbar)
- [x] Tạo `ApiResponse` Trait (`app/Traits/ApiResponse.php`):
  - [x] `success($data, $message, $code)` method
  - [x] `error($message, $code, $errors)` method
  - [x] `paginated($paginator, $message)` method
- [x] Tạo Global Exception Handler:
  - [x] `ValidationException` → 422 + ApiResponse format
  - [x] `AuthenticationException` → 401
  - [x] `AuthorizationException` → 403
  - [x] `ModelNotFoundException` → 404
  - [x] `Throwable` → 500 (hide details in production)
- [x] Cấu hình Sanctum cho SPA auth (CORS, CSRF cookie, stateful domains)
- [x] Cấu hình `config/cors.php` (allowed origins cho frontend)

#### 0.6 Folder Structure (Tạo sẵn cho Production)
- [x] Tạo folders (trống, với `.gitkeep` nếu cần):
  ```
  app/
  ├── DTOs/
  ├── Enums/
  ├── Events/          ← 🔮 Tạo sẵn cho Enhanced (WebSocket)
  ├── Listeners/       ← 🔮 Tạo sẵn
  ├── Http/
  │   ├── Controllers/Api/V1/
  │   ├── Requests/
  │   │   ├── Auth/
  │   │   ├── Project/
  │   │   └── Task/
  │   ├── Resources/
  │   └── Middleware/
  ├── Models/
  ├── Observers/
  ├── Policies/
  ├── Services/
  └── Traits/
  ```
- [x] 🔮 Tạo Event stubs trống (chuẩn bị cho Enhanced WebSocket):
  - [x] `Events/TaskCreated.php` (implements ShouldBroadcast — commented)
  - [x] `Events/TaskMoved.php`
  - [x] `Events/TaskUpdated.php`
  - [x] `Events/TaskDeleted.php`

#### 0.7 Code Quality & Linting
- [x] Cấu hình `pint.json` (PSR-12 preset)
- [x] Tạo `Makefile` hoặc `composer scripts` shortcuts:
  - [x] `lint` → `./vendor/bin/pint`
  - [x] `test` → `./vendor/bin/pest`
  - [x] `fresh` → `php artisan migrate:fresh --seed`
- [ ] Verify: `./vendor/bin/pint --test` pass trên code mới

### Epic 0: Database & Models (Foundation)
- [x] Tạo ALL Enums (5 files)
  - [x] `TaskPriority` (low, medium, high, urgent)
  - [x] `TaskStatus` (open, in_progress, review, done, closed)
  - [x] `TaskType` (task, bug, feature, improvement)
  - [x] `ProjectRole` (owner, admin, member, viewer)
  - [x] `ProjectVisibility` (private, team, public)
- [ ] Tạo ALL Migrations (14 tables)
  - [ ] `users`
  - [ ] `projects`
  - [ ] `project_members`
  - [ ] `boards`
  - [ ] `columns`
  - [ ] `tasks`
  - [ ] `task_assignments`
  - [ ] `labels`
  - [ ] `task_labels`
  - [ ] `checklists`
  - [ ] `checklist_items`
  - [ ] `comments`
  - [ ] `attachments`
  - [ ] `activity_logs`
  - [ ] `notifications` (Laravel default)
  - [ ] `invitations`
- [ ] Tạo ALL Models + Relationships (14 models)
  - [ ] `User` (hasMany projects, members, comments, assignments)
  - [ ] `Project` (belongsTo owner, hasMany boards, members, labels, tasks)
  - [ ] `ProjectMember` (belongsTo project, user)
  - [ ] `Board` (belongsTo project, hasMany columns)
  - [ ] `Column` (belongsTo board, hasMany tasks)
  - [ ] `Task` (belongsTo column/project/reporter, hasMany assignments/comments/checklists, belongsToMany labels, morphMany attachments)
  - [ ] `TaskAssignment` (belongsTo task, user, assigner)
  - [ ] `Label` (belongsTo project, belongsToMany tasks)
  - [ ] `Checklist` (belongsTo task, hasMany items)
  - [ ] `ChecklistItem` (belongsTo checklist)
  - [ ] `Comment` (belongsTo task, user)
  - [ ] `Attachment` (morphTo attachable, belongsTo user)
  - [ ] `ActivityLog` (morphTo loggable, belongsTo user, project)
  - [ ] `Invitation` (belongsTo project, inviter) — model only, chưa dùng trong MVP
- [ ] Tạo Model Factories (3 factories)
  - [ ] `UserFactory`
  - [ ] `ProjectFactory`
  - [ ] `TaskFactory`
- [ ] Tạo Seeders
  - [ ] `UserSeeder` (5 demo users)
  - [ ] `ProjectSeeder` (2-3 projects + members + default boards/columns)
  - [ ] `TaskSeeder` (15-20 tasks + assignments + labels + comments)
  - [ ] `DatabaseSeeder` (orchestrate all seeders)
- [ ] Verify: `php artisan migrate:fresh --seed` chạy thành công

---

## Phase 2: Core Backend APIs (Ngày 5-8)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Hoàn thành 4 Epic API chính (Auth, Project, Board/Column, Task) — để **frontend có thể gọi API thực tế**, xử lý đầy đủ CRUD + authorization + validation, sẵn sàng kết nối UI.

### Epic 1: Authentication (5 features)
- [ ] `LoginRequest` + `RegisterRequest` (Form Request validation)
- [ ] `UserResource` (API Resource)
- [ ] `AuthController` methods:
  - [ ] `register()` → POST `/api/v1/auth/register`
  - [ ] `login()` → POST `/api/v1/auth/login`
  - [ ] `logout()` → POST `/api/v1/auth/logout`
  - [ ] `user()` → GET `/api/v1/auth/user`
  - [ ] `updateProfile()` → PUT `/api/v1/auth/profile`
  - [ ] `uploadAvatar()` → POST `/api/v1/auth/avatar`
- [ ] `FileUploadService` (avatar upload logic)
- [ ] Sanctum SPA configuration (CORS, CSRF cookie)
- [ ] Auth routes trong `api.php`
- [ ] Verify: Test register → login → get user → logout flow qua Postman/curl

### Epic 2: Project Management (7 features)
- [ ] `StoreProjectRequest` (Form Request)
- [ ] `ProjectResource` (API Resource)
- [ ] `ProjectPolicy` (authorization rules: Owner/Admin/Member/Viewer)
- [ ] `ProjectService` (business logic)
  - [ ] `createProject()` — auto tạo default board + 4 columns
  - [ ] `addMember()` — by email, validate user exists
  - [ ] `removeMember()` — validate permissions
- [ ] `ProjectController` methods:
  - [ ] `index()` → GET `/api/v1/projects`
  - [ ] `store()` → POST `/api/v1/projects`
  - [ ] `show()` → GET `/api/v1/projects/{id}`
  - [ ] `update()` → PUT `/api/v1/projects/{id}`
  - [ ] `destroy()` → DELETE `/api/v1/projects/{id}`
  - [ ] `members()` → GET `/api/v1/projects/{id}/members`
  - [ ] `addMember()` → POST `/api/v1/projects/{id}/members`
  - [ ] `removeMember()` → DELETE `/api/v1/projects/{id}/members/{userId}`
- [ ] `EnsureProjectMember` middleware
- [ ] Verify: CRUD project + add/remove member flow

### Epic 3: Board & Column (5 features)
- [ ] `BoardResource`, `ColumnResource` (API Resources)
- [ ] `BoardService` (board + column logic)
  - [ ] `createDefaultBoard()` — tạo "Main Board" + 4 columns
  - [ ] `reorderColumns()` — update positions
- [ ] `BoardController` methods:
  - [ ] `index()` → GET `/api/v1/projects/{id}/boards`
  - [ ] `show()` → GET `/api/v1/boards/{id}` (nested: columns + tasks)
- [ ] `ColumnController` methods:
  - [ ] `store()` → POST `/api/v1/boards/{id}/columns`
  - [ ] `update()` → PUT `/api/v1/columns/{id}`
  - [ ] `destroy()` → DELETE `/api/v1/columns/{id}`
  - [ ] `reorder()` → PUT `/api/v1/boards/{id}/columns/reorder`
- [ ] Nested eager loading: Board → Columns (ordered) → Tasks (ordered)
- [ ] Verify: View board with columns, create/reorder/delete columns

### Epic 4: Task Management (10 features)
- [ ] `StoreTaskRequest`, `UpdateTaskRequest`, `MoveTaskRequest` (Form Requests)
- [ ] `TaskResource` (API Resource — with conditional relationships)
- [ ] `TaskDTO` (Data Transfer Object)
- [ ] `TaskPolicy` (authorization: owner edit own, admin edit all, viewer read-only)
- [ ] `TaskService` (business logic)
  - [ ] `createTask()` — set position at end of column
  - [ ] `moveTask()` — update column_id + position + recalculate
  - [ ] `assignUser()` / `unassignUser()`
  - [ ] `attachLabel()` / `detachLabel()`
- [ ] `TaskController` methods:
  - [ ] `store()` → POST `/api/v1/projects/{id}/tasks`
  - [ ] `show()` → GET `/api/v1/tasks/{id}`
  - [ ] `update()` → PUT `/api/v1/tasks/{id}`
  - [ ] `destroy()` → DELETE `/api/v1/tasks/{id}`
  - [ ] `move()` → POST `/api/v1/tasks/{id}/move`
  - [ ] `assign()` → POST `/api/v1/tasks/{id}/assign`
  - [ ] `unassign()` → DELETE `/api/v1/tasks/{id}/assign/{userId}`
  - [ ] `attachLabel()` → POST `/api/v1/tasks/{id}/labels`
  - [ ] `detachLabel()` → DELETE `/api/v1/tasks/{id}/labels/{labelId}`
- [ ] `LabelController` methods:
  - [ ] `index()` → GET `/api/v1/projects/{id}/labels`
  - [ ] `store()` → POST `/api/v1/projects/{id}/labels`
  - [ ] `update()` → PUT `/api/v1/labels/{id}`
  - [ ] `destroy()` → DELETE `/api/v1/labels/{id}`
- [ ] `LabelResource` (API Resource)
- [ ] Task filter logic (query params: priority, assignee_id, label_id)
- [ ] Verify: Full task CRUD + move + assign + labels flow

---

## Phase 3: Advanced Backend (Ngày 9-11)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Bổ sung các sub-feature còn lại (Checklists, Comments, Attachments, Activity Log) + viết basic tests — để **backend hoàn chỉnh 100%**, frontend chỉ cần render UI.

### Epic 4 (cont.): Checklists
- [ ] `ChecklistController` methods:
  - [ ] `index()` → GET `/api/v1/tasks/{id}/checklists`
  - [ ] `store()` → POST `/api/v1/tasks/{id}/checklists`
  - [ ] `update()` → PUT `/api/v1/checklists/{id}`
  - [ ] `destroy()` → DELETE `/api/v1/checklists/{id}`
- [ ] `ChecklistItemController` methods:
  - [ ] `store()` → POST `/api/v1/checklists/{id}/items`
  - [ ] `update()` → PUT `/api/v1/checklist-items/{id}`
  - [ ] `destroy()` → DELETE `/api/v1/checklist-items/{id}`
  - [ ] `toggle()` → PUT `/api/v1/checklist-items/{id}/toggle`
- [ ] Verify: Checklist CRUD + toggle items

### Epic 5: Comments (3 features)
- [ ] `CommentResource` (API Resource)
- [ ] `CommentPolicy` (chỉ xóa comment mình viết hoặc admin)
- [ ] `CommentController` methods:
  - [ ] `index()` → GET `/api/v1/tasks/{id}/comments`
  - [ ] `store()` → POST `/api/v1/tasks/{id}/comments`
  - [ ] `destroy()` → DELETE `/api/v1/comments/{id}`
- [ ] Verify: Add/list/delete comments on task

### Epic 7: File Attachments (3 features)
- [ ] `AttachmentResource` (API Resource)
- [ ] `FileUploadService` — file validation (max 10MB, allowed types)
- [ ] `AttachmentController` methods:
  - [ ] `index()` → GET `/api/v1/tasks/{id}/attachments`
  - [ ] `store()` → POST `/api/v1/tasks/{id}/attachments`
  - [ ] `destroy()` → DELETE `/api/v1/attachments/{id}`
- [ ] Storage config: local disk, `storage/app/public/attachments/`
- [ ] Verify: Upload/list/delete files on task

### Epic 6: Activity Log (3 features)
- [ ] `ActivityLogService` — static `log()` method
- [ ] `ActivityLogResource` (API Resource)
- [ ] `TaskObserver` — auto log: created, updated, deleted
- [ ] `CommentObserver` — auto log: created, deleted
- [ ] Manual logging trong Services:
  - [ ] Task moved → log trong `TaskService::moveTask()`
  - [ ] Task assigned/unassigned → log trong `TaskService`
  - [ ] Member added/removed → log trong `ProjectService`
  - [ ] Column created/updated/deleted → log trong `BoardService`
- [ ] `ActivityLogController`:
  - [ ] `index()` → GET `/api/v1/projects/{id}/activity` (paginated)
- [ ] Register Observers trong `AppServiceProvider`
- [ ] Verify: Perform actions → check activity log shows correct entries

### Testing (Basic)
- [ ] `LoginTest` — test register, login, logout, get user
- [ ] `RegisterTest` — test validation errors, duplicate email
- [ ] `TaskCrudTest` — test create, read, update, delete task
- [ ] Verify: `php artisan test` — all tests pass

---

## Phase 4: Frontend Foundation (Ngày 12-14)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Dựng xong React skeleton — Router, Stores, Services, Design System, Common Components, Auth Pages — để **user có thể Register → Login → thấy trang Projects trống**, chứng minh frontend kết nối backend thành công.

### Setup & Configuration
- [ ] React 19 app initialization (`main.jsx`)
- [ ] React Router setup (`router/index.jsx`)
  - [ ] Route definitions: `/login`, `/register`, `/projects`, `/projects/:id/board`
  - [ ] Protected route wrapper (auth check)
- [ ] Zustand stores setup
  - [ ] `authStore.js` (user state, login/logout actions)
  - [ ] `projectStore.js` (projects list, current project)
  - [ ] `boardStore.js` (current board, columns, tasks)
- [ ] Axios instance (`services/api.js`)
  - [ ] Base URL config
  - [ ] Request interceptor (CSRF token)
  - [ ] Response interceptor (error handling, 401 redirect)
- [ ] API service layer
  - [ ] `authService.js` (login, register, logout, getUser, updateProfile)
  - [ ] `projectService.js` (CRUD projects, members)
  - [ ] `taskService.js` (CRUD tasks, move, assign, labels, checklists, comments, attachments)

### Design System
- [ ] CSS Variables (dark theme tokens: colors, spacing, fonts, radius)
- [ ] Import Google Font: Inter
- [ ] Global reset + base styles (`app.css`)

### Common Components
- [ ] `AppHeader.jsx` (logo, user avatar, logout)
- [ ] `AppSidebar.jsx` (projects list, create project button)
- [ ] `AppModal.jsx` (reusable modal wrapper)
- [ ] `AppAvatar.jsx` (user avatar with initials fallback)
- [ ] `AppBadge.jsx` (priority/status badges)
- [ ] `AppToast.jsx` (success/error notifications)
- [ ] `AppLoading.jsx` (spinner/skeleton)

### Auth Pages
- [ ] `LoginPage.jsx` (form + validation + redirect)
- [ ] `RegisterPage.jsx` (form + validation + redirect)
- [ ] `useAuth.js` hook (auth state + protected route)
- [ ] Verify: Register → Login → Redirect to projects page

---

## Phase 5: Frontend Core Pages (Ngày 15-18)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Hoàn thiện Kanban Board + Task Detail Modal — **tính năng WOW chính** của dự án. User có thể tạo project, kéo thả task giữa columns, mở modal xem/sửa chi tiết task.

### Project List Page
- [ ] `ProjectListPage.jsx` (layout: sidebar + content area)
- [ ] `ProjectCard.jsx` (project card: name, color, description, member count)
- [ ] Create Project Modal (form inside `AppModal`)
- [ ] Project list fetching + display
- [ ] Click project → navigate to board page
- [ ] Verify: View projects, create new project

### Board Page (Kanban) ⭐
- [ ] `BoardPage.jsx` (layout: header + kanban area)
- [ ] Board header (project name, member avatars, add column button)
- [ ] `KanbanBoard.jsx` (horizontal scrollable container)
- [ ] `KanbanColumn.jsx` (column header + task list + quick add)
  - [ ] Column header: name, color bar, task count, menu (edit/delete)
  - [ ] Quick add task input at bottom
  - [ ] Drop zone for dragged tasks
- [ ] `TaskCard.jsx` (compact card in column)
  - [ ] Title, priority badge, type icon
  - [ ] Label chips
  - [ ] Due date (with overdue indicator)
  - [ ] Assignee avatars
  - [ ] Checklist progress bar (if has checklists)
  - [ ] Click → open Task Detail Modal
- [ ] Drag & Drop implementation
  - [ ] Install `@dnd-kit/react` + `@dnd-kit/dom`
  - [ ] Task drag between columns
  - [ ] Task reorder within column
  - [ ] API sync on drop (`POST /tasks/{id}/move`)
  - [ ] Optimistic UI update
- [ ] `useDragDrop.js` hook
- [ ] Verify: Drag tasks between columns, quick add task, reorder

### Task Detail Modal ⭐
- [ ] `TaskDetailModal.jsx` (2-column layout)
  - [ ] Left column: title, description, checklists, attachments, comments, activity
  - [ ] Right column: assignees, labels, priority, type, due date, column
- [ ] Inline edit: title (click to edit)
- [ ] Textarea: description
- [ ] `TaskAssignees.jsx` (assignee list + add member dropdown)
- [ ] `TaskLabels.jsx` (label chips + add label dropdown)
- [ ] Priority selector (dropdown with color indicators)
- [ ] Type selector (dropdown with icons)
- [ ] Due date picker
- [ ] Verify: Open modal, edit all fields, changes persist

---

## Phase 6: Frontend Polish (Ngày 19-21)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Đánh bóng UI/UX đến mức **production-ready** — checklists, comments, attachments, activity log, filter, empty/loading/error states, responsive — để MVP trông như sản phẩm thật, sẵn sàng demo cho nhà tuyển dụng.

### Task Detail — Sub-features
- [ ] `TaskChecklist.jsx`
  - [ ] List checklists with items
  - [ ] Add new checklist
  - [ ] Add checklist items
  - [ ] Toggle item completion (checkbox)
  - [ ] Progress bar (completed/total)
  - [ ] Delete checklist/item
- [ ] Comments section in Task Detail
  - [ ] `CommentList.jsx` (list of comments)
  - [ ] `CommentItem.jsx` (avatar + name + time + content + delete button)
  - [ ] Comment input (textarea + submit button)
- [ ] Attachments section in Task Detail
  - [ ] File upload (click or drag & drop zone)
  - [ ] File list (name + size + delete button)
- [ ] `ActivityTimeline.jsx`
  - [ ] Timeline UI in task modal (recent activities for this task)
  - [ ] Activity feed on project page (recent activities for project)
  - [ ] Activity item: avatar + description + timestamp

### Board — Additional Features
- [ ] Filter bar on board page
  - [ ] Priority filter (dropdown)
  - [ ] Assignee filter (dropdown)
  - [ ] Clear filters button
- [ ] Column management
  - [ ] Edit column name (inline)
  - [ ] Edit column color
  - [ ] Delete column (with confirmation)
  - [ ] Drag & Drop columns to reorder
- [ ] `MemberList.jsx` (project members panel/dropdown)
  - [ ] List members with roles
  - [ ] Add member form (email input)
  - [ ] Remove member button

### UX Polish
- [ ] Loading states (skeleton loaders on board, spinners on actions)
- [ ] Error handling (toast messages on API errors)
- [ ] Empty states (no projects, no tasks, no comments illustration)
- [ ] Responsive design (mobile-friendly sidebar collapse, scroll board)
- [ ] Keyboard shortcuts: Escape to close modal
- [ ] `NotFoundPage.jsx` (404 page)
- [ ] Smooth transitions (modal open/close, toast slide)

### Final Checks
- [ ] Run `./vendor/bin/pint` — fix code style
- [ ] Run `php artisan test` — all tests pass
- [ ] `php artisan migrate:fresh --seed` — seeders work
- [ ] `docker compose up -d` — everything runs
- [ ] Manual walkthrough: full user flow from register to kanban

---

## 🏁 MVP Definition of Done

- [ ] User có thể Register → Login → Tạo Project → Thêm Members
- [ ] Kanban board hiển thị columns + tasks, hỗ trợ Drag & Drop
- [ ] Task Detail Modal đầy đủ: description, assignees, labels, checklists, comments, attachments, activity
- [ ] RBAC hoạt động: Owner/Admin có quyền cao hơn Member/Viewer
- [ ] Activity Log ghi lại mọi thao tác quan trọng
- [ ] Seeder tạo demo data để showcase
- [ ] Docker chạy được bằng 1 command: `docker compose up -d`
- [ ] Code sạch: PSR-12, meaningful naming, PHPDoc trên services
- [ ] README có hướng dẫn cài đặt + screenshots
- [ ] Ít nhất 5-10 Feature tests chạy pass
- [ ] UI dark theme, trông chuyên nghiệp

---

## 🚀 Enhanced Phase (Tuần 4-5) — Sau khi MVP xong

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Nâng cấp dự án lên **portfolio-grade** — CI/CD pipeline, real-time WebSocket, dashboard analytics, full test suite, API docs — để **nổi bật hơn 90% ứng viên khác** khi phỏng vấn.

### DevOps: GitHub Actions CI (Ưu tiên 1 — 1 ngày)
- [ ] Tạo `.env.ci` (environment cho CI testing)
- [ ] Tạo `.github/workflows/ci.yml`
  - [ ] Job 1: Code Quality — Laravel Pint (`./vendor/bin/pint --test`)
  - [ ] Job 2: Tests — Setup PHP 8.4 + MySQL service → Run Pest
  - [ ] Job 3: Build Frontend — `npm ci` → `npm run build`
- [ ] Thêm CI status badge vào `README.md`
- [ ] Push code → Verify CI chạy green ✅
- [ ] Tạo `.dockerignore` (loại bỏ node_modules, .git, tests khỏi image)
- [ ] Verify: Push code → 3 jobs pass → Green badge trên README

### Real-time Kanban (Ưu tiên 2 — 2 ngày)
- [ ] Cài `laravel/reverb` + `predis/predis`
- [ ] Cài `laravel-echo` + `pusher-js` (frontend)
- [ ] Thêm `redis` + `reverb` services vào `docker-compose.yml`
- [ ] Tạo Events: `TaskCreated`, `TaskMoved`, `TaskUpdated`, `TaskDeleted`
- [ ] Broadcast events trên channel `project.{id}`
- [ ] Frontend: Listen events → update Zustand store → board auto-refresh
- [ ] Verify: 2 browser tabs → drag task ở tab 1 → tab 2 cập nhật real-time

### Dashboard Analytics (Ưu tiên 3 — 1.5 ngày)
- [ ] `DashboardController` + `DashboardService`
- [ ] API endpoint: `GET /api/v1/dashboard`
- [ ] Query: tasks by status (pie chart), tasks by priority, completed this week
- [ ] Frontend: `DashboardPage.jsx` với Chart.js charts
- [ ] Verify: Dashboard hiển thị charts với data thật từ DB

### Full Test Suite (Ưu tiên 4 — 2 ngày)
- [ ] Auth tests: register, login, logout, get user, validation errors
- [ ] Project tests: CRUD, add/remove member, policy checks
- [ ] Task tests: CRUD, move, assign, labels, checklists
- [ ] Comment tests: create, delete, policy
- [ ] Activity Log tests: auto logging on task actions
- [ ] Target: ≥ 60% code coverage
- [ ] Verify: `php artisan test` → all green

### API Documentation (Ưu tiên 5 — 0.5 ngày)
- [ ] Cài `knuckleswtf/scribe`
- [ ] Thêm annotations vào Controllers
- [ ] Generate docs: `php artisan scribe:generate`
- [ ] Verify: API docs accessible tại `/docs`

### README & Portfolio Polish (0.5 ngày)
- [ ] README song ngữ (Việt + English)
- [ ] Screenshots / GIF demo
- [ ] Tech stack badges
- [ ] Hướng dẫn cài đặt (Docker)
- [ ] `CONTRIBUTING.md` (conventional commits, branch strategy)
- [ ] GitHub repo: pinned, topics, description

