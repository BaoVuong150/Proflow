import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import AppRouter from './router'

function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return <AppRouter />
}

export default App
