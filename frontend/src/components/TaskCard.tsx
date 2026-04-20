import type { Task } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoardStore } from '../stores/boardStore'

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
}

export default function TaskCard({ task, isOverlay }: TaskCardProps) {
  const setSelectedTask = useBoardStore((s) => s.setSelectedTask)
  const isSyncing = useBoardStore((s) => s.syncingTasks.includes(task.id))
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  const formatDueDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedTask(task)}
      className={`bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg p-3.5 cursor-grab hover:border-[var(--color-accent)] hover:shadow-md transition-all group ${isOverlay ? 'shadow-xl rotate-2 cursor-grabbing border-[var(--color-accent)] scale-105' : ''}`}
    >
      {/* Label Chips */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold leading-tight"
              style={{ 
                backgroundColor: `${label.color}22`, 
                color: label.color,
                border: `1px solid ${label.color}44`
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title & Sync Status */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
          {task.title}
        </p>
        {isSyncing && (
          <svg className="animate-spin h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>
      
      {/* Badges Row: Priority + Type + Due Date */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {task.type && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
            {task.type === 'bug' && '🐛'}
            {task.type === 'feature' && '✨'}
            {task.type === 'task' && '📋'}
            {task.type === 'improvement' && '🔧'}
            {task.type}
          </span>
        )}
        {task.priority && (
          <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider
            ${task.priority === 'low' ? 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]' : ''}
            ${task.priority === 'medium' ? 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]' : ''}
            ${task.priority === 'high' ? 'bg-[rgba(249,115,22,0.15)] text-[#f97316]' : ''}
            ${task.priority === 'urgent' ? 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]' : ''}`}
          >
            {task.priority}
          </span>
        )}
        {task.due_date && (
          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold ${isOverdue ? 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'}`}>
            📅 {formatDueDate(task.due_date)}
            {isOverdue && ' ⚠'}
          </span>
        )}
      </div>

      {/* Bottom Row: Checklist Progress + Assignees */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Checklist progress placeholder - shown when checklists data exists */}
          {task.checklist_progress !== undefined && task.checklist_progress !== null && (
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${task.checklist_progress}%`,
                    backgroundColor: task.checklist_progress === 100 ? '#22c55e' : 'var(--color-accent)'
                  }}
                />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                {task.checklist_progress === 100 ? '✓' : `${task.checklist_progress}%`}
              </span>
            </div>
          )}
        </div>
        
        {/* Assignee Avatars */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((user) => (
              <div
                key={user.id}
                title={user.name}
                className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[8px] font-bold text-white uppercase border border-[var(--color-bg-tertiary)]"
              >
                {user.name.substring(0, 2)}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-[8px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-bg-tertiary)]">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
