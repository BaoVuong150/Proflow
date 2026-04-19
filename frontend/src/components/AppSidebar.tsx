import { Link } from 'react-router'
import type { Project } from '../types'

interface AppSidebarProps {
  projects: Project[]
  currentProjectId?: number
  onCreateProject: () => void
}

export default function AppSidebar({ projects, currentProjectId, onCreateProject }: AppSidebarProps) {
  return (
    <aside className="w-[260px] hidden md:flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-default)] h-[calc(100vh-56px)] shrink-0 sticky top-[56px]">
      <div className="p-4 flex items-center justify-between border-b border-[var(--color-border-default)]">
        <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Your Projects</h2>
        <button 
          onClick={onCreateProject}
          className="w-6 h-6 flex items-center justify-center rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)] hover:text-white transition-colors cursor-pointer text-lg leading-none"
          title="Create Project"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 ? (
          <div className="px-4 py-3 text-sm text-[var(--color-text-muted)] italic">
            No projects found.
          </div>
        ) : (
          <ul className="flex flex-col gap-1 px-2">
            {projects.map(project => {
              const isActive = project.id === currentProjectId
              return (
                <li key={project.id}>
                  <Link
                    to={`/projects/${project.id}/board`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold' 
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ background: project.color || 'var(--color-accent)' }}
                    />
                    <span className="truncate flex-1">{project.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
