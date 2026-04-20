import { useState, useEffect } from 'react'
import type { ActivityLog } from '../types'
import { taskFeatureService } from '../services/taskFeatureService'

interface ActivityTimelineProps {
  projectId: number
  taskId: number
}

export default function ActivityTimeline({ projectId, taskId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await taskFeatureService.getTaskActivities(projectId, taskId)
        // Handle both paginated and non-paginated responses safely
        const activityList = Array.isArray(data.data) ? data.data : (data.data?.data || [])
        setActivities(activityList)
      } catch (err) {
        console.error('Failed to load activities:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [projectId, taskId])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-6 border-t border-[var(--color-border-default)] pt-6">
        <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          ⏱️ Activity History
        </label>
        <div className="animate-pulse flex gap-4">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] shrink-0"></div>
          <div className="h-16 bg-[var(--color-bg-secondary)] rounded-lg w-full max-w-[50%]"></div>
        </div>
      </div>
    )
  }

  if (activities.length === 0) return null

  return (
    <div className="flex flex-col gap-4 mt-6 border-t border-[var(--color-border-default)] pt-6">
      <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
        ⏱️ Activity History
      </label>

      <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-border-default)] before:to-transparent">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-bold uppercase">
              {activity.user?.name?.substring(0, 2) || '??'}
            </div>
            
            {/* Content box */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[var(--color-bg-secondary)] p-3 rounded border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[var(--color-text-primary)] text-sm">{activity.user?.name || 'System'}</span>
                <time className="text-xs text-[var(--color-text-muted)] font-medium">
                  {new Date(activity.created_at).toLocaleString()}
                </time>
              </div>
              <div className="text-xs text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-text-primary)]">{activity.action.split('.').pop()}</span>
                {' '}{activity.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
