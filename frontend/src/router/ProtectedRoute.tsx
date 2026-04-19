import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../stores/authStore'
import AppLoading from '../components/AppLoading'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) return <AppLoading />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute
