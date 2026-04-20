import { useState, useEffect } from 'react'
import type { ActivityLog } from '../types'
import { projectService } from '../services/projectService'

interface ProjectActivitySidebarProps {
  projectId: number
  isOpen: boolean
  onClose: () => void
}

export default function ProjectActivitySidebar({ projectId, isOpen, onClose }: ProjectActivitySidebarProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchActivities = async () => {
      setIsLoading(true)
      try {
        const { data } = await projectService.getProjectActivities(projectId)
        const activityList = Array.isArray(data.data) ? data.data : (data.data?.data || [])
        setActivities(activityList) 
      } catch (err) {
        console.error('Failed to load project activities:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [projectId, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--color-bg-primary)] shadow-2xl flex flex-col transform transition-transform border-l border-[var(--color-border-default)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Project Activity</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-8 w-8 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center text-[var(--color-text-muted)] py-10 italic">
              No activity recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-border-default)] before:to-transparent">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 z-10 group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] shadow-sm shrink-0 text-xs font-bold uppercase mt-1">
                    {activity.user?.name?.substring(0, 2) || '??'}
                  </div>
                  
                  <div className="flex-1 bg-[var(--color-bg-secondary)] p-3 rounded-lg border border-[var(--color-border-default)] shadow-sm">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-bold text-[var(--color-text-primary)] text-sm truncate">
                        {activity.user?.name || 'System'}
                      </span>
                      <time className="text-xs text-[var(--color-text-muted)] font-medium shrink-0">
                        {new Date(activity.created_at).toLocaleDateString()} {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                      <span className="font-semibold text-[var(--color-accent)]">{activity.action.split('.').pop()}</span>
                      {' '}{activity.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
