# 🛠️ ProFlow — Tech Stack Specification

> **Tài liệu này định nghĩa CHÍNH XÁC phiên bản của từng công nghệ** sử dụng trong dự án ProFlow.
> Mọi cài đặt và cấu hình PHẢI tuân theo file này để đảm bảo tính nhất quán.
> 
> **Cập nhật lần cuối:** 2026-04-17

---

## 📋 Tổng Quan Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  React 19 + React Router 7 + Zustand 5 + Vite 8               │
│  @dnd-kit/react 0.3 + Chart.js 4.5 + Axios 1.15               │
├─────────────────────────────────────────────────────────────────┤
│                         │ HTTP / REST API                       │
├─────────────────────────────────────────────────────────────────┤
│                       NGINX 1.30 (Reverse Proxy)                │
├─────────────────────────────────────────────────────────────────┤
│                    PHP 8.4 + Laravel 13 (Backend)               │
│  Sanctum 4.3 + Pint 1.29 + Pest 4.6                           │
├─────────────────────────────────────────────────────────────────┤
│                       MySQL 8.4 LTS (Database)                  │
├─────────────────────────────────────────────────────────────────┤
│                    Docker + Docker Compose (DevOps)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend Stack

### Core Runtime

| Công nghệ | Phiên bản | Vai trò | Ghi chú |
|---|---|---|---|
| **PHP** | `8.4.x` | Runtime language | Laravel 13 yêu cầu ≥ 8.3. Dùng 8.4 vì nằm trong Active Support, có tính năng mới (Property Hooks, Asymmetric Visibility) |
| **Composer** | `2.x` (latest) | PHP dependency manager | Cài trong Docker image |

> **Tại sao PHP 8.4 thay vì 8.5?**
> PHP 8.5 vừa ra (Apr 2026). Laravel 13 + packages chưa chắc fully tested trên 8.5. PHP 8.4 là lựa chọn an toàn nhất — active support + đã ổn định.

### Framework & First-Party Packages

| Package | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **Laravel Framework** | `^13.0` | Web framework | `composer create-project laravel/laravel proflow` |
| **Laravel Sanctum** | `^4.0` | SPA Authentication (cookie-based) | Built-in với Laravel 13 |
| **Laravel Pint** | `^1.18` | Code style fixer (PSR-12) | `composer require laravel/pint --dev` |
| **Laravel Tinker** | `^2.0` | REPL for debugging | Built-in với Laravel 13 |

### Testing

| Package | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **Pest PHP** | `^4.0` | Testing framework (trên nền PHPUnit 12) | `composer require pestphp/pest --dev --with-all-dependencies` |
| **Pest Laravel Plugin** | `^4.0` | Laravel-specific test helpers | `composer require pestphp/pest-plugin-laravel --dev` |

### Development Tools

| Package | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **Laravel IDE Helper** | `^3.0` | Auto-complete cho IDE | `composer require barryvdh/laravel-ide-helper --dev` |
| **Laravel Debugbar** | `^3.0` | Debug toolbar (dev only) | `composer require barryvdh/laravel-debugbar --dev` |

---

## 🎨 Frontend Stack

### Core

| Công nghệ | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **Node.js** | `22.x LTS` | JavaScript runtime | Cài trên host machine hoặc Docker |
| **npm** | `10.x` | Package manager (đi kèm Node.js) | Đi kèm Node.js |

> **Tại sao Node.js 22 thay vì 24?**
> Node.js 22 đang ở Maintenance LTS — ổn định nhất. Node.js 24 là Active LTS nhưng tương đối mới. Vite 8 + React 19 đã tested kỹ trên Node 22.

### Build Tool

| Công nghệ | Phiên bản | Vai trò | Ghi chú |
|---|---|---|---|
| **Vite** | `^8.0` | Build tool + HMR dev server | Sử dụng Rolldown bundler (Rust-based, cực nhanh). Đi kèm via `laravel-vite-plugin` |
| **laravel-vite-plugin** | `^1.0` | Tích hợp Vite với Laravel | `npm install laravel-vite-plugin` |
| **@vitejs/plugin-react** | `^6.0` | Vite React plugin (dùng Oxc, không cần Babel) | `npm install @vitejs/plugin-react` |

### UI Framework

| Công nghệ | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **React** | `^19.0` | Reactive UI library | `npm install react@^19 react-dom@^19` |
| **React Router** | `^7.0` | SPA routing | `npm install react-router@^7` |
| **Zustand** | `^5.0` | State management (lightweight) | `npm install zustand@^5` |

### UI Libraries

| Công nghệ | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **@dnd-kit/react** | `^0.3` | Drag & Drop (Kanban board) | `npm install @dnd-kit/react` |
| **@dnd-kit/dom** | `latest` | DOM adapter cho dnd-kit | `npm install @dnd-kit/dom` |
| **Chart.js** | `^4.5` | Data visualization (Dashboard) | `npm install chart.js` |
| **react-chartjs-2** | `^5.3` | React wrapper cho Chart.js | `npm install react-chartjs-2` |

### HTTP & Utilities

| Công nghệ | Phiên bản | Vai trò | Install command |
|---|---|---|---|
| **Axios** | `^1.15.0` | HTTP client | `npm install axios@^1.15.0` |

> [!CAUTION]
> **Axios Security Alert:** Phiên bản 1.14.1 và 0.30.4 bị supply chain attack (RAT malware) vào 31/03/2026. **BẮT BUỘC dùng ≥ 1.15.0.** Kiểm tra package-lock.json để xác nhận phiên bản an toàn.

### Fonts

| Công nghệ | Source | Vai trò |
|---|---|---|
| **Inter** | Google Fonts (CDN) | Primary font — Modern, professional, excellent readability |

---

## 🗄️ Database

| Công nghệ | Phiên bản | Vai trò | Ghi chú |
|---|---|---|---|
| **MySQL** | `8.4 LTS` | Primary database | Long-Term Support, production-ready. MySQL 8.0 đã EOL (Apr 2026) |

> **Tại sao MySQL 8.4 LTS thay vì 8.0?**
> MySQL 8.0 chính thức End of Life tháng 4/2026. MySQL 8.4 LTS là lựa chọn chính thức duy nhất còn được support. Hơn nữa, dùng phiên bản mới nhất thể hiện bạn cập nhật công nghệ — điểm cộng với nhà tuyển dụng.

---

## 🐳 DevOps & Infrastructure

### Docker (MVP: 3 services)

| Service | Docker Image | Phiên bản | Port |
|---|---|---|---|
| **app** | `php:8.4-fpm` | 8.4 | 9000 (internal) |
| **nginx** | `nginx:1.30-alpine` | 1.30 stable | 80 → host 8000 |
| **mysql** | `mysql:8.4` | 8.4 LTS | 3306 → host 3306 |

### Docker Compose Version

| Công nghệ | Phiên bản | Ghi chú |
|---|---|---|
| **Docker Engine** | `≥ 24.0` | Compose V2 built-in |
| **Docker Compose** | `v2.x` | Dùng `docker compose` (không space) |

### Enhanced Phase (Tuần 4-5 — thêm sau)

| Service | Docker Image | Phiên bản | Port | Ghi chú |
|---|---|---|---|---|
| **redis** | `redis:7-alpine` | 7.x | 6379 | Cache + Queue + Session |
| **reverb** | (cùng app image) | — | 8080 | WebSocket server |
| **queue** | (cùng app image) | — | — | Queue worker |
| **scheduler** | (cùng app image) | — | — | Task scheduler |

---

## 📂 Version Control & CI

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **Git** | `≥ 2.40` | Version control |
| **GitHub** | — | Repository hosting |
| **GitHub Actions** | — | CI/CD pipeline (Enhanced phase) |

### Git Convention

| Aspect | Standard |
|---|---|
| **Commit format** | Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:` |
| **Branch strategy** | `main` → `develop` → `feature/xxx` |
| **PR template** | Có mô tả changes + screenshots |

---

## 📐 Coding Standards

### Backend (PHP/Laravel)

| Standard | Tool | Ghi chú |
|---|---|---|
| **Code Style** | PSR-12 via Laravel Pint | Auto-fix: `./vendor/bin/pint` |
| **PHP Features** | PHP 8.4 modern syntax | Enums, Named Args, Match, Readonly, Property Hooks |
| **Documentation** | PHPDoc trên Services, DTOs | Không cần doc trên mọi method, chỉ public API |
| **Architecture** | Controller → Service → Model | Thin Controllers, Fat Services |

### Frontend (React)

| Standard | Ghi chú |
|---|---|
| **Components** | Functional Components + Hooks — KHÔNG dùng Class Components |
| **State** | Zustand stores — KHÔNG dùng Redux |
| **Naming** | Components: PascalCase, hooks: `use` prefix |
| **CSS** | CSS Modules hoặc scoped CSS + CSS Variables (design tokens) |
| **File extension** | `.jsx` cho components, `.js` cho utilities |

---

## 📦 Full Dependency Summary

### composer.json (Backend)

```json
{
    "require": {
        "php": "^8.4",
        "laravel/framework": "^13.0",
        "laravel/sanctum": "^4.0",
        "laravel/tinker": "^2.0"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "laravel/pint": "^1.18",
        "mockery/mockery": "^1.6",
        "pestphp/pest": "^4.0",
        "pestphp/pest-plugin-laravel": "^4.0",
        "barryvdh/laravel-ide-helper": "^3.0",
        "barryvdh/laravel-debugbar": "^3.0"
    }
}
```

### package.json (Frontend)

```json
{
    "dependencies": {
        "react": "^19.0",
        "react-dom": "^19.0",
        "react-router": "^7.0",
        "zustand": "^5.0",
        "axios": "^1.15.0",
        "@dnd-kit/react": "^0.3",
        "@dnd-kit/dom": "latest",
        "chart.js": "^4.5",
        "react-chartjs-2": "^5.3"
    },
    "devDependencies": {
        "vite": "^8.0",
        "laravel-vite-plugin": "^1.0",
        "@vitejs/plugin-react": "^6.0"
    }
}
```

---

## 🔄 Enhanced Phase — Additional Dependencies

> Chỉ cài khi MVP hoàn thành, chuyển sang Enhanced phase.

### Backend (Composer)

| Package | Phiên bản | Vai trò |
|---|---|---|
| **laravel/reverb** | `^1.0` | WebSocket server (Real-time Kanban) |
| **predis/predis** | `^2.0` | Redis PHP client |

### Frontend (npm)

| Package | Phiên bản | Vai trò |
|---|---|---|
| **laravel-echo** | `^2.0` | WebSocket client (listen events) |
| **pusher-js** | `^8.0` | WebSocket protocol (required by Echo) |

---

## ⚠️ Version Pinning Rules

1. **Composer:** Dùng `^` (caret) cho tất cả packages — cho phép minor/patch updates
2. **npm:** Dùng `^` (caret) cho tất cả packages
3. **Docker images:** Pin đến **minor version** (`php:8.4-fpm`, `mysql:8.4`, `nginx:1.30-alpine`)
4. **Lock files:** LUÔN commit `composer.lock` và `package-lock.json` vào Git
5. **Không dùng `latest` tag** trong Docker production — luôn pin version

---

## 📝 Ghi Chú Cho AI Assistant

> Khi scaffold project hoặc cài đặt dependencies, **BẮT BUỘC** tuân theo phiên bản trong file này.
> - PHP 8.4, Laravel 13, MySQL 8.4 LTS
> - React 19, React Router 7, Zustand 5, Vite 8
> - @dnd-kit/react cho Drag & Drop (KHÔNG dùng react-beautiful-dnd)
> - Axios ≥ 1.15.0 (tránh supply chain attack)
> - Node.js 22 LTS
> - Docker: php:8.4-fpm, nginx:1.30-alpine, mysql:8.4
