# ProFlow

[![CI/CD](https://github.com/BaoVuong150/Proflow/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/BaoVuong150/Proflow/actions)
![Tech Stack](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

ProFlow is a modern Kanban board application (Trello clone) designed for efficient project management. Built with Laravel 13 on the backend and React 19 on the frontend, focusing on a clean architecture, solid design principles, and a robust user experience.

## Features (MVP)
- User Authentication (Laravel Sanctum SPA)
- Project & Member Management (RBAC)
- Kanban Boards & Drag-and-Drop Columns/Tasks
- Activity Logging

## Installation (Docker)
1. Clone the repository
2. Run `docker compose up -d`
3. Enter the PHP container: `docker compose exec app sh`
4. Run migrations: `php artisan migrate --seed`
5. Open browser at `http://localhost:8000`
