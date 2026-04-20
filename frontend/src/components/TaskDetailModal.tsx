import type { Task } from '../types'
import AppModal from './AppModal'
import { useState, useEffect } from 'react'
import { taskService } from '../services/taskService'
import { useBoardStore } from '../stores/boardStore'
import TaskChecklists from './TaskChecklists'
import TaskComments from './TaskComments'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
}

export default function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority || '')
  const [type, setType] = useState(task.type || '')
  const [dueDate, setDueDate] = useState(task.due_date?.split('T')[0] || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const { columns, setSelectedTask } = useBoardStore()

  // Sync state when task prop changes
  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description || '')
    setPriority(task.priority || '')
    setType(task.type || '')
    setDueDate(task.due_date?.split('T')[0] || '')
    setSaveStatus('idle')
  }, [task])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    try {
      const payload: Record<string, unknown> = {
        title,
        description: description || null,
        priority: priority || null,
        type: type || null,
        due_date: dueDate || null,
        column_id: task.column_id,
      }
      const { data } = await taskService.update(task.id, payload as Partial<Task>)
      
      // Update the task in the board store columns
      useBoardStore.setState((state) => ({
        columns: state.columns.map((col) => ({
          ...col,
          tasks: col.tasks?.map((t) => t.id === task.id ? { ...t, ...data.data } : t)
        })),
        selectedTask: { ...task, ...data.data }
      }))

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to save task:', err)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await taskService.destroy(task.id)
      // Remove task from board store
      useBoardStore.setState((state) => ({
        columns: state.columns.map((col) => ({
          ...col,
          tasks: col.tasks?.filter((t) => t.id !== task.id)
        })),
        selectedTask: null
      }))
      onClose()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const hasChanges = title !== task.title 
    || description !== (task.description || '') 
    || priority !== (task.priority || '') 
    || type !== (task.type || '') 
    || dueDate !== (task.due_date?.split('T')[0] || '')

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Custom Header with Delete */}
      <div className="flex items-center justify-between mb-4 -mt-2 pr-8">
        <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          Task #{task.id}
        </span>
        <button 
          onClick={handleDelete}
          className="text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          🗑 Delete
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 min-h-[420px]">
        {/* ═══ Left Column (Main content) ═══ */}
        <div className="flex-[2] flex flex-col gap-5">
          {/* Title - Inline Edit */}
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="text-xl font-bold text-[var(--color-text-primary)] bg-transparent outline-none border-b-2 border-transparent focus:border-[var(--color-accent)] w-full py-1 transition-colors"
            placeholder="Task title..."
          />
          
          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">📄 Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              className="w-full min-h-[100px] p-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none focus:border-[var(--color-accent)] resize-y transition-colors"
            />
          </div>

          {/* Labels display */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">🏷️ Labels</label>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="text-xs px-3 py-1 rounded-full font-semibold"
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
            </div>
          )}

          {/* Assignees display */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">👥 Assignees</label>
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-full px-3 py-1">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[8px] font-bold text-white uppercase">
                      {user.name.substring(0, 2)}
                    </div>
                    <span className="text-xs font-medium text-[var(--color-text-primary)]">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklists Section */}
          <TaskChecklists taskId={task.id} />

          {/* Comments Section */}
          <TaskComments taskId={task.id} />
        </div>

        {/* ═══ Right Column (Metadata) ═══ */}
        <div className="flex-1 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-[var(--color-border-default)] pt-4 md:pt-0 md:pl-6 min-w-[200px]">
          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">📊 Priority</label>
            <select 
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)] outline-none cursor-pointer focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">None</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">📋 Type</label>
            <select 
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)] outline-none cursor-pointer focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="">None</option>
              <option value="task">📋 Task</option>
              <option value="bug">🐛 Bug</option>
              <option value="feature">✨ Feature</option>
              <option value="improvement">🔧 Improvement</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">📅 Due Date</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)] outline-none cursor-pointer focus:border-[var(--color-accent)] transition-colors" 
            />
          </div>

          {/* Column (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">📁 Column</label>
            <div className="flex items-center gap-2 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)]">
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ background: columns.find(c => c.id === task.column_id)?.color || 'var(--color-accent)' }}
              />
              {columns.find(c => c.id === task.column_id)?.name || 'Unknown'}
            </div>
          </div>

          {/* Meta Info */}
          <div className="mt-auto pt-4 border-t border-[var(--color-border-default)] flex flex-col gap-1 text-[10px] text-[var(--color-text-muted)]">
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border-default)]">
        <div className="text-xs font-medium">
          {saveStatus === 'saved' && <span className="text-green-400">✓ Saved successfully</span>}
          {saveStatus === 'error' && <span className="text-red-400">✕ Failed to save</span>}
          {hasChanges && saveStatus === 'idle' && <span className="text-yellow-400">● Unsaved changes</span>}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </AppModal>
  )
}
