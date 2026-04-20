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
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchActivities = async (currentPage: number, isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true)
    else setIsLoading(true)

    try {
      const { data } = await taskFeatureService.getTaskActivities(projectId, taskId, currentPage)
      const payload = data.data
      const activityList = Array.isArray(payload) ? payload : (payload?.data || [])
      
      if (payload && payload.meta) {
        setHasMore(payload.meta.current_page < payload.meta.last_page)
      } else {
        setHasMore(activityList.length === 10)
      }

      setActivities(prev => isLoadMore ? [...prev, ...activityList] : activityList)
    } catch (err) {
      console.error('Failed to load activities:', err)
    } finally {
      if (isLoadMore) setIsLoadingMore(false)
      else setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchActivities(1, false)
  }, [projectId, taskId])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-6 border-t border-[var(--color-border-default)] pt-6">
        <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          ⏱️ Activity History
        </label>
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
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
        {activities.map((activity, index) => (
          <div key={`${activity.id}-${index}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
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

        {hasMore && (
          <div className="pt-4 text-center relative z-10 bg-[var(--color-bg-primary)]">
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-1.5 text-xs font-semibold bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
