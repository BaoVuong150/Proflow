# 📚 ProFlow — Official Documentation References

> **Mục đích:** Lưu trữ link tài liệu chính thức cho AI assistant tham chiếu.
> **Sắp xếp theo:** Mức độ rủi ro AI bị sai (cao → thấp).

---

## 🔴 RỦI RO CAO — AI rất dễ sai (công nghệ MỚI, ra sau thời điểm training)

### 1. Laravel 13 ⚠️⚠️⚠️
> **Lý do rủi ro:** Ra mắt 17/03/2026 — cực kỳ mới. AI hầu như chưa được train trên version này. Dễ nhầm syntax/API với Laravel 10/11/12.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://laravel.com/docs/13.x |
| **Upgrade Guide (12→13)** | https://laravel.com/docs/13.x/upgrade |
| **Release Notes** | https://laravel.com/docs/13.x/releases |
| **Sanctum (SPA Auth)** | https://laravel.com/docs/13.x/sanctum |
| **Eloquent ORM** | https://laravel.com/docs/13.x/eloquent |
| **Migrations** | https://laravel.com/docs/13.x/migrations |
| **Policies (Authorization)** | https://laravel.com/docs/13.x/authorization |
| **Form Requests** | https://laravel.com/docs/13.x/validation#form-request-validation |
| **API Resources** | https://laravel.com/docs/13.x/eloquent-resources |
| **Observers** | https://laravel.com/docs/13.x/eloquent#observers |
| **Notifications** | https://laravel.com/docs/13.x/notifications |
| **Broadcasting** | https://laravel.com/docs/13.x/broadcasting |
| **File Storage** | https://laravel.com/docs/13.x/filesystem |
| **Testing** | https://laravel.com/docs/13.x/testing |

**Những thay đổi quan trọng cần lưu ý:**
- Yêu cầu PHP ≥ 8.3
- AI SDK mới (first-party) — ta không dùng nhưng cần biết
- JSON:API resources mới
- Cải tiến caching, queues, security
- Reverb giờ có DB driver (không cần Redis bắt buộc)

---

### 2. React 19 ⚠️⚠️⚠️
> **Lý do rủi ro:** React 19 có nhiều thay đổi lớn: Server Components, Actions, use() hook, useFormStatus, useOptimistic. AI dễ nhầm với React 18 patterns.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://react.dev/ |
| **React 19 What's New** | https://react.dev/blog/2024/12/05/react-19 |
| **Hooks Reference** | https://react.dev/reference/react/hooks |
| **useEffect** | https://react.dev/reference/react/useEffect |
| **useState** | https://react.dev/reference/react/useState |
| **Context API** | https://react.dev/reference/react/useContext |

**Features mới React 19 ta có thể dùng:**
```jsx
// use() hook — đọc promises/context trực tiếp
const data = use(fetchPromise);

// useOptimistic — optimistic UI updates (Kanban drag)
const [optimisticTasks, addOptimistic] = useOptimistic(tasks, (state, newTask) => [...state, newTask]);

// Metadata in components — SEO
<title>ProFlow - Board</title>
<meta name="description" content="..." />
```

---

### 3. Vite 8 ⚠️⚠️⚠️
> **Lý do rủi ro:** Ra mắt 12/03/2026. Rolldown bundler thay thế esbuild + Rollup. Config có thể khác hoàn toàn Vite 5/6/7.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://vite.dev/guide/ |
| **Config Reference** | https://vite.dev/config/ |
| **Migration from v7** | https://vite.dev/guide/migration |
| **Laravel Vite Plugin** | https://laravel.com/docs/13.x/vite |

**Cần lưu ý:**
- Rolldown là bundler mới (Rust-based), thay thế esbuild + Rollup
- Config syntax có thể khác Vite cũ
- `@vitejs/plugin-react` v6 dùng Oxc thay Babel

---

### 4. React Router 7 ⚠️⚠️
> **Lý do rủi ro:** React Router 7 hợp nhất với Remix. API thay đổi nhiều so với v6.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://reactrouter.com/ |
| **Getting Started** | https://reactrouter.com/start |
| **Route Configuration** | https://reactrouter.com/start/library/routing |

**Cần lưu ý:**
- React Router 7 = Remix + React Router hợp nhất
- Ta dùng ở chế độ **library mode** (SPA), không phải framework mode
- `createBrowserRouter` vẫn hoạt động
- Loader/Action patterns có sẵn nhưng optional cho SPA

---

### 5. Zustand 5 ⚠️⚠️
> **Lý do rủi ro:** Major version mới. API changes possible.

| Tài liệu | Link |
|---|---|
| **GitHub Repo** | https://github.com/pmndrs/zustand |
| **Official Docs** | https://zustand.docs.pmnd.rs/ |
| **npm** | https://www.npmjs.com/package/zustand |

**Cách dùng cơ bản:**
```jsx
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    const { data } = await authService.login(credentials)
    set({ user: data.user, isAuthenticated: true })
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}))

// Dùng trong component
function Profile() {
  const user = useAuthStore((state) => state.user)
  return <div>{user?.name}</div>
}
```

---

### 6. Pest PHP 4 ⚠️⚠️
> **Lý do rủi ro:** Major version, built trên PHPUnit 12. Browser testing mới. Yêu cầu PHP ≥ 8.3.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://pestphp.com/docs |
| **Writing Tests** | https://pestphp.com/docs/writing-tests |
| **Expectations (Assertions)** | https://pestphp.com/docs/expectations |
| **Laravel Plugin** | https://pestphp.com/docs/plugins/laravel |
| **Upgrade Guide** | https://pestphp.com/docs/upgrade-guide |

---

## 🟡 RỦI RO TRUNG BÌNH — AI có thể nhầm version/syntax

### 7. @dnd-kit/react ⚠️
> **Lý do rủi ro:** Kiến trúc mới — modular (abstract → dom → react). API khác hoàn toàn @dnd-kit/core cũ. AI rất dễ nhầm.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://dndkit.com/ |
| **GitHub Repo** | https://github.com/clauderic/dnd-kit |
| **npm** | https://www.npmjs.com/package/@dnd-kit/react |

**Cần lưu ý — ĐỪNG NHẦM:**
```
❌ react-beautiful-dnd    → Deprecated, không maintain
❌ @dnd-kit/core (v1)     → Phiên bản cũ, API khác
✅ @dnd-kit/react (v0.3)  → Phiên bản mới, ĐÂY LÀ CÁI TA DÙNG
```

---

### 8. PHP 8.4 ⚠️
> **Lý do rủi ro:** Property Hooks, Asymmetric Visibility là features mới. AI dễ nhầm với PHP 8.1/8.2 syntax.

| Tài liệu | Link |
|---|---|
| **What's new in 8.4** | https://www.php.net/releases/8.4/en.php |
| **Migration Guide** | https://www.php.net/manual/en/migration84.php |
| **Enums (8.1+)** | https://www.php.net/manual/en/language.enumerations.php |
| **Readonly Properties (8.2+)** | https://www.php.net/manual/en/language.oop5.properties.php |

---

### 9. @vitejs/plugin-react 6 ⚠️
> **Lý do rủi ro:** Version 6 dùng Oxc thay Babel. Config có thể khác.

| Tài liệu | Link |
|---|---|
| **npm** | https://www.npmjs.com/package/@vitejs/plugin-react |
| **GitHub** | https://github.com/vitejs/vite-plugin-react |

---

### 10. Laravel Sanctum 4 (SPA Auth) ⚠️
> **Lý do rủi ro:** SPA auth config (CORS, CSRF, cookies) phức tạp. AI dễ nhầm giữa token auth và cookie auth.

| Tài liệu | Link |
|---|---|
| **Official Docs** | https://laravel.com/docs/13.x/sanctum |
| **SPA Authentication** | https://laravel.com/docs/13.x/sanctum#spa-authentication |

**Ta dùng chế độ: SPA Authentication (cookie-based, KHÔNG phải token)**
```
Frontend (React) → GET /sanctum/csrf-cookie → POST /api/v1/auth/login
                    ↑ CSRF token cookie         ↑ Session cookie set
```

---

## 🟢 RỦI RO THẤP — AI biết rõ, ít thay đổi

### 11. Axios 1.15
| Tài liệu | Link |
|---|---|
| **Official Docs** | https://axios-http.com/docs/intro |
| **npm** | https://www.npmjs.com/package/axios |

### 12. Chart.js 4.5 + react-chartjs-2
| Tài liệu | Link |
|---|---|
| **Chart.js Docs** | https://www.chartjs.org/docs/latest/ |
| **react-chartjs-2 Docs** | https://react-chartjs-2.js.org/ |

### 13. MySQL 8.4 LTS
| Tài liệu | Link |
|---|---|
| **Release Notes** | https://dev.mysql.com/doc/relnotes/mysql/8.4/en/ |
| **Reference Manual** | https://dev.mysql.com/doc/refman/8.4/en/ |
| **Docker Hub** | https://hub.docker.com/_/mysql |

### 14. Docker + Docker Compose
| Tài liệu | Link |
|---|---|
| **Docker Docs** | https://docs.docker.com/ |
| **Compose Reference** | https://docs.docker.com/compose/compose-file/ |
| **PHP Image** | https://hub.docker.com/_/php |
| **Nginx Image** | https://hub.docker.com/_/nginx |
| **MySQL Image** | https://hub.docker.com/_/mysql |

### 15. GitHub Actions
| Tài liệu | Link |
|---|---|
| **Workflow Syntax** | https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions |
| **PHP Actions** | https://github.com/shivammathur/setup-php |

### 16. Laravel Pint
| Tài liệu | Link |
|---|---|
| **Official Docs** | https://laravel.com/docs/13.x/pint |

---

## 📝 Ghi Chú Cho AI Assistant

> **Khi code, ưu tiên tra cứu docs theo thứ tự rủi ro:**
> 1. 🔴 Laravel 13, React 19, Vite 8, React Router 7, Zustand 5, Pest 4 → **PHẢI đọc docs mới**
> 2. 🟡 @dnd-kit/react, PHP 8.4, plugin-react 6, Sanctum SPA → **Cẩn thận syntax**
> 3. 🟢 Axios, Chart.js, Docker → **Đã biết rõ, ít thay đổi**
>
> **Quy tắc: Khi không chắc chắn về API/syntax của tech 🔴🟡 → đọc URL docs ở trên TRƯỚC khi code.**
