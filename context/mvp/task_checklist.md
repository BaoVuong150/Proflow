# ✅ ProFlow MVP — Task Checklist

> **Tracking tiến độ MVP.** Cập nhật trạng thái khi hoàn thành từng task.
> `[ ]` chưa làm · `[/]` đang làm · `[x]` hoàn thành
> **[LUẬT BẮT BUỘC]: Làm xong chức năng nào, AI phải tự động mở file này lên và đổi `[ ]` thành `[x]` ngay lập tức.**

---

## [x] Phase 1: Backend Foundation (Ngày 1-4)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Xây dựng xong toàn bộ nền móng backend — database schema, models, relationships, enums, seeders — để **mọi API endpoint ở Phase 2 chỉ cần viết Controller + Service là chạy được ngay**, không cần quay lại sửa migration hay model.

### [x] Epic 0: Project Scaffold & Infrastructure

#### 0.1 Git & Repository
- [x] `git init` + tạo `.gitignore` (Laravel default + custom rules)
- [x] Tạo GitHub repository (public)
- [x] Setup branch strategy: `main` → `develop` → `feature/*`
- [x] Push initial commit: `chore: initial project setup`
- [x] Tạo `README.md` (skeleton: project name, description, tech stack badge placeholder)
- [x] Tạo `.editorconfig` (indent, charset, end_of_line)

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
- [x] Verify: `docker compose up -d` chạy thành công
- [x] Verify: `docker compose exec app php artisan --version` trả về Laravel 13

#### 0.4 Frontend Setup
- [x] Cài frontend dependencies:
  - [x] ✅ MVP: React 19, React Router 7, Zustand 5, Axios ≥1.15.0, @dnd-kit/react
  - [x] 🔮 Enhanced (chưa cài, note trong package.json): chart.js, react-chartjs-2, laravel-echo, pusher-js
- [x] Cấu hình `vite.config.js` + `@vitejs/plugin-react` + `laravel-vite-plugin`
- [x] Tạo `resources/views/app.blade.php` (SPA entry point + Vite directives)
- [x] Verify: `npm run dev` chạy HMR thành công

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
- [x] Verify: `./vendor/bin/pint --test` pass trên code mới

### [x] Epic 0: Database & Models (Foundation)
- [x] Tạo ALL Enums (5 files)
  - [x] `TaskPriority` (low, medium, high, urgent)
  - [x] `TaskStatus` (open, in_progress, review, done, closed)
  - [x] `TaskType` (task, bug, feature, improvement)
  - [x] `ProjectRole` (owner, admin, member, viewer)
  - [x] `ProjectVisibility` (private, team, public)
- [x] Tạo ALL Migrations (14 tables)
  - [x] `users`
  - [x] `projects`
  - [x] `project_members`
  - [x] `boards`
  - [x] `columns`
  - [x] `tasks`
  - [x] `task_assignments`
  - [x] `labels`
  - [x] `task_labels`
  - [x] `checklists`
  - [x] `checklist_items`
  - [x] `comments`
  - [x] `attachments`
  - [x] `activity_logs`
  - [x] `notifications` (Laravel default)
  - [x] `invitations`
- [x] Tạo ALL Models + Relationships (14 models)
  - [x] `User` (hasMany projects, members, comments, assignments)
  - [x] `Project` (belongsTo owner, hasMany boards, members, labels, tasks)
  - [x] `ProjectMember` (belongsTo project, user)
  - [x] `Board` (belongsTo project, hasMany columns)
  - [x] `Column` (belongsTo board, hasMany tasks)
  - [x] `Task` (belongsTo column/project/reporter, hasMany assignments/comments/checklists, belongsToMany labels, morphMany attachments)
  - [x] `TaskAssignment` (belongsTo task, user, assigner)
  - [x] `Label` (belongsTo project, belongsToMany tasks)
  - [x] `Checklist` (belongsTo task, hasMany items)
  - [x] `ChecklistItem` (belongsTo checklist)
  - [x] `Comment` (belongsTo task, user)
  - [x] `Attachment` (morphTo attachable, belongsTo user)
  - [x] `ActivityLog` (morphTo loggable, belongsTo user, project)
  - [x] `Invitation` (belongsTo project, inviter) — model only, chưa dùng trong MVP
- [x] Tạo Model Factories (3 factories)
  - [x] `UserFactory`
  - [x] `ProjectFactory`
  - [x] `TaskFactory`
- [x] Tạo Seeders
  - [x] `UserSeeder` (5 demo users)
  - [x] `ProjectSeeder` (2-3 projects + members + default boards/columns)
  - [x] `TaskSeeder` (15-20 tasks + assignments + labels + comments)
  - [x] `DatabaseSeeder` (orchestrate all seeders)
- [x] Verify: `php artisan migrate:fresh --seed` chạy thành công

---

## Phase 2: Core Backend APIs (Ngày 5-8)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Hoàn thành 4 Epic API chính (Auth, Project, Board/Column, Task) — để **frontend có thể gọi API thực tế**, xử lý đầy đủ CRUD + authorization + validation, sẵn sàng kết nối UI.

### [x] Epic 1: Authentication (5 features)
- [x] `LoginRequest` + `RegisterRequest` (Form Request validation)
- [x] `UserResource` (API Resource)
- [x] `AuthController` methods:
  - [x] `register()` → POST `/api/v1/auth/register`
  - [x] `login()` → POST `/api/v1/auth/login`
  - [x] `logout()` → POST `/api/v1/auth/logout`
  - [x] `user()` → GET `/api/v1/auth/user`
- [x] Route config trong `routes/api.php`
- [x] Cấu hình rate limiting (Login: 5 attempts/min)
- [x] Verify: Gọi API `/api/v1/auth/user` trả về 401 nếu chưa login, 200 + user data nếu đã login.
- [x] Sanctum SPA configuration (CORS, CSRF cookie)
- [x] Auth routes trong `api.php`
- [x] Verify: Test register → login → get user → logout flow qua Pest Tests
- [x] Đã bổ sung và pass 100% các Edge Cases bảo mật

### [x] Epic 2: Project Management (7 features)
- [x] `StoreProjectRequest` (Form Request)
- [x] `ProjectResource` (API Resource)
- [x] `ProjectPolicy` (authorization rules: Owner/Admin/Member/Viewer)
- [x] `ProjectService` (business logic)
  - [x] `createProject()` — auto tạo default board + 4 columns
  - [x] `addMember()` — by email, validate user exists
  - [x] `removeMember()` — validate permissions
- [x] `ProjectController` methods:
  - [x] `index()` → GET `/api/v1/projects`
  - [x] `store()` → POST `/api/v1/projects`
  - [x] `show()` → GET `/api/v1/projects/{id}`
  - [x] `update()` → PUT `/api/v1/projects/{id}`
  - [x] `destroy()` → DELETE `/api/v1/projects/{id}`
  - [x] `members()` → GET `/api/v1/projects/{id}/members`
  - [x] `addMember()` → POST `/api/v1/projects/{id}/members`
  - [x] `removeMember()` → DELETE `/api/v1/projects/{id}/members/{userId}`
- [x] `EnsureProjectMember` middleware (Thay thế bằng ProjectPolicy)
- [x] Verify: CRUD project + add/remove member flow qua Pest Tests
- [x] Đã bổ sung và pass 100% các Edge Cases bảo mật

### [x] Epic 3: Board & Column (5 features)
- [x] `BoardResource`, `ColumnResource` (API Resources)
- [x] `BoardService` (board + column logic)
  - [x] `reorderColumns()` — update positions
- [x] `BoardController` methods:
  - [x] `index()` → GET `/api/v1/projects/{id}/boards`
  - [x] `show()` → GET `/api/v1/boards/{id}` (nested: columns + tasks)
- [x] `ColumnController` methods:
  - [x] `store()` → POST `/api/v1/boards/{id}/columns`
  - [x] `update()` → PUT `/api/v1/columns/{id}`
  - [x] `destroy()` → DELETE `/api/v1/columns/{id}`
  - [x] `reorder()` → PUT `/api/v1/boards/{id}/columns/reorder`
- [x] Nested eager loading: Board → Columns (ordered) → Tasks (ordered)
- [x] Verify: View board with columns, create/reorder/delete columns qua Pest Tests
- [x] Đã bổ sung và pass 100% các Edge Cases bảo mật

### Epic 4: Task Management (10 features)
- [x] `StoreTaskRequest`, `UpdateTaskRequest`, `MoveTaskRequest` (Form Requests)
- [x] `TaskResource` (API Resource — with conditional relationships)
- [x] `TaskDTO` (Data Transfer Object)
- [x] `TaskPolicy` (authorization: owner edit own, admin edit all, viewer read-only)
- [x] `TaskService` (business logic)
  - [x] `createTask()` — set position at end of column
  - [x] `moveTask()` — update column_id + position + recalculate
  - [x] `assignUser()` / `unassignUser()`
  - [x] `attachLabel()` / `detachLabel()`
- [x] `TaskController` methods:
  - [x] `store()` → POST `/api/v1/projects/{id}/tasks`
  - [x] `show()` → GET `/api/v1/tasks/{id}`
  - [x] `update()` → PUT `/api/v1/tasks/{id}`
  - [x] `destroy()` → DELETE `/api/v1/tasks/{id}`
  - [x] `move()` → POST `/api/v1/tasks/{id}/move`
  - [x] `assign()` → POST `/api/v1/tasks/{id}/assign`
  - [x] `unassign()` → DELETE `/api/v1/tasks/{id}/assign/{userId}`
  - [x] `attachLabel()` → POST `/api/v1/tasks/{id}/labels`
  - [x] `detachLabel()` → DELETE `/api/v1/tasks/{id}/labels/{labelId}`
- [x] `LabelController` methods:
  - [x] `index()` → GET `/api/v1/projects/{id}/labels`
  - [x] `store()` → POST `/api/v1/projects/{id}/labels`
  - [x] `update()` → PUT `/api/v1/labels/{id}`
  - [x] `destroy()` → DELETE `/api/v1/labels/{id}`
- [x] `LabelResource` (API Resource)
- [x] Task filter logic (query params: priority, assignee_id, label_id)
- [x] Verify: Full task CRUD + move + assign + labels flow
- [x] Đã bổ sung và pass 100% các Edge Cases bảo mật

---

## Phase 3: Advanced Backend (Ngày 9-11)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Bổ sung các sub-feature còn lại (Checklists, Comments, Attachments, Activity Log) + viết basic tests — để **backend hoàn chỉnh 100%**, frontend chỉ cần render UI.

### [x] Epic 4 (cont.): Checklists
- [x] `ChecklistController` methods:
  - [x] `index()` → GET `/api/v1/tasks/{id}/checklists`
  - [x] `store()` → POST `/api/v1/tasks/{id}/checklists`
  - [x] `update()` → PUT `/api/v1/checklists/{id}`
  - [x] `destroy()` → DELETE `/api/v1/checklists/{id}`
- [x] `ChecklistItemController` methods:
  - [x] `store()` → POST `/api/v1/checklists/{id}/items`
  - [x] `update()` → PUT `/api/v1/checklist-items/{id}`
  - [x] `destroy()` → DELETE `/api/v1/checklist-items/{id}`
  - [x] `toggle()` → PUT `/api/v1/checklist-items/{id}/toggle`
- [x] Verify: Checklist CRUD + toggle items

### [x] Epic 5: Comments (3 features)
- [x] `CommentResource` (API Resource)
- [x] `CommentPolicy` (chỉ xóa comment mình viết hoặc admin)
- [x] `CommentController` methods:
  - [x] `index()` → GET `/api/v1/tasks/{id}/comments`
  - [x] `store()` → POST `/api/v1/tasks/{id}/comments`
  - [x] `destroy()` → DELETE `/api/v1/comments/{id}`
- [x] Verify: Add/list/delete comments on task

### [x] Epic 7: File Attachments (3 features)
- [x] `AttachmentResource` (API Resource)
- [x] `FileUploadService` — file validation (max 10MB, allowed types)
- [x] `AttachmentController` methods:
  - [x] `index()` → GET `/api/v1/tasks/{id}/attachments`
  - [x] `store()` → POST `/api/v1/tasks/{id}/attachments`
  - [x] `destroy()` → DELETE `/api/v1/attachments/{id}`
- [x] Storage config: local disk, `storage/app/public/attachments/`
- [x] Verify: Upload/list/delete files on task

### [x] Epic 6: Activity Log (3 features)
- [x] `ActivityLogService` — static `log()` method
- [x] `ActivityLogResource` (API Resource)
- [x] `TaskObserver` — auto log: created, updated, deleted
- [x] `CommentObserver` — auto log: created, deleted
- [x] Manual logging trong Services:
  - [x] Task moved → log trong `TaskService::moveTask()`
  - [x] Task assigned/unassigned → log trong `TaskService`
  - [x] Member added/removed → log trong `ProjectService`
  - [x] Column created/updated/deleted → log trong `ColumnController`
- [x] `ActivityLogController`:
  - [x] `index()` → GET `/api/v1/projects/{id}/activity` (paginated)
- [x] Register Observers trong `AppServiceProvider`
- [x] Verify: Perform actions → check activity log shows correct entries

### [x] Testing (Basic)
- [x] `LoginTest` — test register, login, logout, get user
- [x] `RegisterTest` — test validation errors, duplicate email
- [x] `TaskCrudTest` — test create, read, update, delete task
- [x] Verify: `php artisan test` — all tests pass
- [x] Đã bổ sung và pass 100% các Edge Cases bảo mật

---

## [x] Phase 4: Frontend Foundation (Ngày 12-14)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Dựng xong React skeleton — Router, Stores, Services, Design System, Common Components, Auth Pages — để **user có thể Register → Login → thấy trang Projects trống**, chứng minh frontend kết nối backend thành công.

### Setup & Configuration
- [x] React 19 app initialization (`main.tsx`)
- [x] React Router setup (`router/index.tsx`)
  - [x] Route definitions: `/login`, `/register`, `/projects`, `/projects/:id/board`
  - [x] Protected route wrapper (auth check)
- [x] Zustand stores setup
  - [x] `authStore.ts` (user state, login/logout actions)
  - [x] `projectStore.ts` (projects list, current project)
  - [x] `boardStore.ts` (current board, columns, tasks)
- [x] Axios instance (`services/api.ts`)
  - [x] Base URL config
  - [x] Request interceptor (CSRF token)
  - [x] Response interceptor (error handling, 401 redirect)
- [x] API service layer
  - [x] `authService.ts` (login, register, logout, getUser, updateProfile)
  - [x] `projectService.ts` (CRUD projects, members)
  - [x] `taskService.ts` (CRUD tasks, move, assign, labels, checklists, comments, attachments)

### Design System
- [x] CSS Variables (dark theme tokens: colors, spacing, fonts, radius)
- [x] Import Google Font: Inter
- [x] Global reset + base styles (`app.css` using Tailwind v4 @theme)

### Common Components
- [x] `AppHeader.tsx` (logo, user avatar, logout)
- [x] `AppSidebar.tsx` (projects list, create project button)
- [x] `AppModal.tsx` (reusable modal wrapper)
- [x] `AppAvatar.tsx` (user avatar with initials fallback)
- [x] `AppBadge.tsx` (priority/status badges)
- [x] `AppToast.tsx` (success/error notifications)
- [x] `AppLoading.tsx` (spinner/skeleton)

### Auth Pages
- [x] `LoginPage.tsx` (form + validation + redirect)
- [x] `RegisterPage.tsx` (form + validation + redirect)
- [x] `useAuth.ts` hook (auth state + protected route)
- [x] Verify: Register → Login → Redirect to projects page

---

## [x] Phase 5: Frontend Core Pages (Ngày 15-18)

> 🎯 **MỤC TIÊU TỐI THƯỢNG:** Hoàn thiện Kanban Board + Task Detail Modal — **tính năng WOW chính** của dự án. User có thể tạo project, kéo thả task giữa columns, mở modal xem/sửa chi tiết task.

### Project List Page
- [x] `ProjectListPage.tsx` (layout: sidebar + content area)
- [x] `ProjectCard.tsx` (project card: name, color, description, member count)
- [x] Create Project Modal (form inside `AppModal`)
- [x] Project list fetching + display
- [x] Click project → navigate to board page
- [x] Verify: View projects, create new project

### Board Page (Kanban) ⭐
- [x] `BoardPage.tsx` (layout: header + kanban area)
- [x] Board header (project name, member avatars, add column button)
- [x] `KanbanBoard.tsx` (horizontal scrollable container)
- [x] `KanbanColumn.tsx` (column header + task list + quick add)
  - [x] Column header: name, color bar, task count, menu (edit/delete)
  - [x] Quick add task input at bottom
  - [x] Drop zone for dragged tasks
- [x] `TaskCard.tsx` (compact card in column)
  - [x] Title, priority badge, type icon
  - [x] Label chips
  - [x] Due date (with overdue indicator)
  - [x] Assignee avatars
  - [x] Checklist progress bar (if has checklists)
  - [x] Click → open Task Detail Modal
- [x] Drag & Drop implementation
  - [x] Install `@dnd-kit/react` + `@dnd-kit/dom`
  - [x] Task drag between columns
  - [x] Task reorder within column
  - [x] API sync on drop (`POST /tasks/{id}/move`)
  - [x] Optimistic UI update
- [x] `useDragDrop.js` hook
- [x] Verify: Drag tasks between columns, quick add task, reorder

### Task Detail Modal ⭐
- [x] `TaskDetailModal.jsx` (2-column layout)
  - [x] Left column: title, description, checklists, attachments, comments, activity
  - [x] Right column: assignees, labels, priority, type, due date, column
- [x] Inline edit: title (click to edit)
- [x] Textarea: description
- [x] `TaskAssignees.jsx` (assignee list + add member dropdown)
- [x] `TaskLabels.jsx` (label chips + add label dropdown)
- [x] Priority selector (dropdown with color indicators)
- [x] Type selector (dropdown with icons)
- [x] Due date picker
- [x] Verify: Open modal, edit all fields, changes persist

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

### Security & Production Readiness (New Epic)
- [ ] Setup SSL/HTTPS certificates for Nginx in production (`SESSION_SECURE_COOKIE=true`).
- [ ] Add strict `Content-Security-Policy` (CSP) header in Nginx to prevent XSS executing malicious scripts.
- [ ] Implement Business Quotas / Resource Limits (e.g. Free Tier = Max 5 Projects) for rate limiting and DoS prevention.
