import { Link } from 'react-router'
import { useAuthStore } from '../stores/authStore'
import AppAvatar from './AppAvatar'

interface AppHeaderProps {
  title?: React.ReactNode
  children?: React.ReactNode
}

export default function AppHeader({ title, children }: AppHeaderProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-default)] shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="text-lg font-extrabold flex items-center gap-2 text-[var(--color-text-primary)] hover:opacity-80 transition-opacity no-underline">
          <span className="text-[var(--color-accent)]">◆</span> 
          <span className="hidden sm:inline">ProFlow</span>
        </Link>
        
        {title && (
          <>
            <div className="w-px h-6 bg-[var(--color-border-default)] mx-2 hidden sm:block"></div>
            <div className="text-[var(--color-text-primary)] font-semibold truncate max-w-[300px]">
              {title}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {children}
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{user?.name}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{user?.email}</span>
          </div>
          <AppAvatar name={user?.name} size="md" />
          <button
            onClick={logout}
            className="ml-2 px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] rounded-lg
              hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] border border-transparent hover:border-[var(--color-border-default)] transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
