import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '../stores/authStore'
import AppLoading from '../components/AppLoading'

function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) return <AppLoading />
  if (isAuthenticated) return <Navigate to="/projects" replace />

  return <Outlet />
}

export default GuestRoute
