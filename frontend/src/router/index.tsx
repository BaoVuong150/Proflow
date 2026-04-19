import { Routes, Route, Navigate } from 'react-router'
import ProtectedRoute from './ProtectedRoute'
import GuestRoute from './GuestRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ProjectListPage from '../pages/ProjectListPage'
import BoardPage from '../pages/BoardPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:projectId/board" element={<BoardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  )
}

export default AppRouter
