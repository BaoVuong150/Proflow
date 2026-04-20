import { Routes, Route, Navigate } from 'react-router'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProjectListPage from '../pages/ProjectListPage'
import BoardPage from '../pages/BoardPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId/boards/:boardId" element={<BoardPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
