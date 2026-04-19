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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedTask(task)}
      className={`bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg p-4 cursor-grab hover:border-[var(--color-accent)] hover:shadow-md transition-all group ${isOverlay ? 'shadow-xl rotate-2 cursor-grabbing border-[var(--color-accent)] scale-105' : ''}`}
    >
      <p className="text-sm font-medium mb-3 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
        {task.title}
      </p>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          {task.priority && (
            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest
              ${task.priority === 'low' ? 'bg-[rgba(34,197,94,0.15)] text-[var(--color-priority-low)]' : ''}
              ${task.priority === 'medium' ? 'bg-[rgba(245,158,11,0.15)] text-[var(--color-priority-medium)]' : ''}
              ${task.priority === 'high' ? 'bg-[rgba(249,115,22,0.15)] text-[var(--color-priority-high)]' : ''}
              ${task.priority === 'urgent' ? 'bg-[rgba(239,68,68,0.15)] text-[var(--color-priority-urgent)]' : ''}`}
            >
              {task.priority}
            </span>
          )}
          {task.type && (
            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
              {task.type}
            </span>
          )}
        </div>
        
        {/* Placeholder for Assignee Avatar */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[8px] font-bold text-white uppercase">
            {task.assignees[0].name.substring(0, 2)}
          </div>
        )}
      </div>
    </div>
  )
}
