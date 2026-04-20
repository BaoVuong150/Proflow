import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'
import AppRouter from './router'

function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'text-sm font-semibold rounded-lg shadow-lg border border-[var(--color-border-default)]',
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
          },
          success: {
            iconTheme: { primary: 'var(--color-accent)', secondary: '#fff' },
          },
        }}
      />
      <AppRouter />
    </>
  )
}

export default App
