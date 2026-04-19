import type { Task } from '../types'
import AppModal from './AppModal'
import { useState } from 'react'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
}

export default function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="flex flex-col md:flex-row gap-6 min-h-[400px]">
        {/* Left Column (Main content) */}
        <div className="flex-[2] flex flex-col gap-6">
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="text-2xl font-bold text-[var(--color-text-primary)] bg-transparent outline-none border-b border-transparent focus:border-[var(--color-accent)] w-full py-1"
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--color-text-secondary)]">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              className="w-full min-h-[120px] p-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none focus:border-[var(--color-accent)] resize-y"
            />
          </div>
        </div>

        {/* Right Column (Meta data) */}
        <div className="flex-1 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-[var(--color-border-default)] pt-5 md:pt-0 md:pl-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Priority</label>
            <select className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)] outline-none cursor-pointer" defaultValue={task.priority || ''}>
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Type</label>
            <select className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)] outline-none cursor-pointer" defaultValue={task.type || ''}>
              <option value="">None</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Assignees</label>
            <div className="text-sm text-[var(--color-text-secondary)] p-2 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border-default)] cursor-pointer text-center hover:bg-[var(--color-bg-hover)] transition-colors">
              + Add Assignee
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Labels</label>
            <div className="text-sm text-[var(--color-text-secondary)] p-2 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border-default)] cursor-pointer text-center hover:bg-[var(--color-bg-hover)] transition-colors">
              + Add Label
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Due Date</label>
            <input type="date" className="w-full p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-sm text-[var(--color-text-primary)] outline-none cursor-pointer" defaultValue={task.due_date?.split('T')[0] || ''} />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--color-border-default)]">
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer">
          Cancel
        </button>
        <button className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">
          Save Changes
        </button>
      </div>
    </AppModal>
  )
}
