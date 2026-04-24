# ProFlow - Real-time Kanban Board 🚀

[![CI/CD](https://github.com/BaoVuong150/Proflow/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/BaoVuong150/Proflow/actions)
![Laravel](https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

*[Read in Vietnamese below / Đọc bản Tiếng Việt bên dưới](#-bản-tiếng-việt)*

ProFlow is a modern, enterprise-grade Kanban board application (Trello clone) designed for efficient team collaboration. Built with **Laravel 11 (Octane)** on the backend and **React 19** on the frontend, focusing on clean architecture, real-time synchronization, and a premium user experience.

## ✨ Key Features
- **Real-time Collaboration:** Board updates instantly across all connected clients via WebSocket (Laravel Reverb/Pusher).
- **Advanced Drag & Drop:** Seamless task movement with `@dnd-kit/react`.
- **Role-Based Access Control (RBAC):** Owner, Admin, and Member permissions via Laravel Policies.
- **Activity Logging & Timelines:** Complete history of who did what, and when.
- **High Performance:** Backend runs on Laravel Octane (FrankenPHP) with Redis caching.
- **Dark Mode UI:** Sleek, modern, and accessible user interface using Tailwind CSS.

## 📸 Screenshots
*(Add screenshots or GIFs of the Kanban board, Task Details, and Activity Log here)*
> **[Placeholder]** `![Kanban Board Demo](./docs/board-demo.gif)`

## 🚀 Quick Start (Docker)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/BaoVuong150/Proflow.git
   cd Proflow
   ```
2. **Start the containers:**
   ```bash
   docker compose up -d
   ```
3. **Initialize the Backend:**
   ```bash
   docker compose exec app sh
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```
4. **Initialize the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. **Open Browser:** `http://localhost:5173` (Frontend) & `http://localhost:8000/docs` (API Docs).

---

# 🇻🇳 Bản Tiếng Việt

ProFlow là một ứng dụng quản lý công việc theo chuẩn Kanban (tương tự Trello) được thiết kế chuyên nghiệp dành cho làm việc nhóm. Ứng dụng được xây dựng trên nền tảng **Laravel 11 (Octane)** cho Backend và **React 19** cho Frontend, tập trung vào kiến trúc sạch, đồng bộ thời gian thực và trải nghiệm người dùng cao cấp.

## ✨ Tính Năng Nổi Bật
- **Đồng Bộ Thời Gian Thực (Real-time):** Mọi thao tác kéo thả, tạo mới thẻ công việc sẽ lập tức hiện trên màn hình của những người khác thông qua WebSocket.
- **Kéo Thả Nâng Cao:** Sử dụng thư viện `@dnd-kit` cho trải nghiệm mượt mà 60fps.
- **Phân Quyền Chi Tiết (RBAC):** Phân chia rõ ràng quyền hạn của Owner, Admin và Member.
- **Nhật Ký Hoạt Động (Activity Log):** Ghi vết 100% mọi hành động của người dùng trong hệ thống.
- **Hiệu Năng Cao:** Backend sử dụng công nghệ Laravel Octane (FrankenPHP) kết hợp bộ nhớ đệm Redis.
- **Giao Diện Dark Mode:** Sang trọng, hiện đại và thân thiện với mắt người dùng.

## 📸 Ảnh Chụp Màn Hình
*(Chèn ảnh chụp màn hình hoặc GIF demo tại đây)*
> **[Chờ cập nhật]** `![Kanban Board Demo](./docs/board-demo.gif)`

## 🚀 Hướng Dẫn Cài Đặt (Sử Dụng Docker)
1. **Tải mã nguồn:**
   ```bash
   git clone https://github.com/BaoVuong150/Proflow.git
   cd Proflow
   ```
2. **Khởi động Docker:**
   ```bash
   docker compose up -d
   ```
3. **Cài đặt Backend:**
   ```bash
   docker compose exec app sh
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```
4. **Cài đặt Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. **Trải nghiệm:** Mở trình duyệt tại `http://localhost:5173` để xem giao diện và `http://localhost:8000/docs` để xem tài liệu API.

## 🤝 Đóng Góp (Contributing)
Mọi đóng góp (Pull Request) đều được hoan nghênh. Vui lòng đọc kỹ hướng dẫn tại [CONTRIBUTING.md](./CONTRIBUTING.md) trước khi bắt đầu.
