import type { Column } from '../types'
import TaskCard from './TaskCard'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useState } from 'react'
import { taskService } from '../services/taskService'
import { useBoardStore } from '../stores/boardStore'

interface KanbanColumnProps {
  column: Column
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(column.name)
  
  const addTaskToColumn = useBoardStore((s) => s.addTaskToColumn)
  const board = useBoardStore((s) => s.board)

  const handleSaveName = () => {
    if (editName.trim() && editName.trim() !== column.name) {
      useBoardStore.getState().updateColumn(column.id, { name: editName.trim() })
    } else {
      setEditName(column.name)
    }
    setIsEditingName(false)
  }

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  })

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !board?.project_id) {
      setIsAdding(false)
      setNewTaskTitle('')
      return
    }

    try {
      setIsSubmitting(true)
      const { data } = await taskService.create(board.project_id, {
        title: newTaskTitle.trim(),
        column_id: column.id
      })
      
      addTaskToColumn(column.id, data.data)
      setNewTaskTitle('')
      setIsAdding(false)
    } catch (err) {
      console.error('Failed to create task:', err)
      alert('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateTask()
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTaskTitle('')
    }
  }

  return (
    <div 
      ref={setNodeRef}
      className="w-[300px] min-w-[300px] bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-default)] flex flex-col h-full max-h-full"
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-4 border-b border-[var(--color-border-default)] shrink-0 group">
        <div 
          className="w-2.5 h-2.5 rounded-full shrink-0 relative cursor-pointer" 
          style={{ background: column.color || 'var(--color-accent)' }} 
          title="Change Color"
        >
          {/* Extremely simple color picker hidden overlay */}
          <input 
            type="color" 
            value={column.color || '#3b82f6'} 
            onChange={(e) => useBoardStore.getState().updateColumn(column.id, { color: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        
        {isEditingName ? (
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName()
              if (e.key === 'Escape') {
                setEditName(column.name)
                setIsEditingName(false)
              }
            }}
            className="flex-1 text-sm font-semibold bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded px-1.5 py-0.5 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
        ) : (
          <h3 
            onClick={() => setIsEditingName(true)}
            className="text-sm font-semibold flex-1 text-[var(--color-text-primary)] cursor-text hover:bg-[var(--color-bg-hover)] rounded px-1.5 py-0.5 -ml-1.5 transition-colors truncate"
            title="Click to rename"
          >
            {column.name}
          </h3>
        )}

        <span className="text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full border border-[var(--color-border-default)]">
          {column.tasks?.length || 0}
        </span>

        <button 
          onClick={() => {
            if (confirm(`Are you sure you want to delete the column "${column.name}"? All tasks inside will be lost.`)) {
              useBoardStore.getState().deleteColumn(column.id)
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded transition-all cursor-pointer -mr-2"
          title="Delete Column"
        >
          ✕
        </button>
      </div>

      {/* Task List */}
      <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 relative min-h-[10px]">
          {column.tasks?.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          
          {(!column.tasks || column.tasks.length === 0) && !isAdding && (
            <div className="flex items-center justify-center text-xs text-[var(--color-text-muted)] italic pointer-events-none p-4 text-center border-2 border-dashed border-[var(--color-border-default)] rounded-lg m-3">
              Drop tasks here
            </div>
          )}
          
          {isAdding && (
            <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-accent)] rounded-lg p-3 shadow-md mt-1">
              <input
                autoFocus
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                placeholder="What needs to be done?"
                className="w-full text-sm bg-transparent outline-none text-[var(--color-text-primary)] mb-3"
              />
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={() => {
                    setIsAdding(false)
                    setNewTaskTitle('')
                  }}
                  disabled={isSubmitting}
                  className="px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTask}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-xs font-medium bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '...' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Quick Add Button */}
      {!isAdding && (
        <div className="p-3 border-t border-[var(--color-border-default)] shrink-0">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+</span> Add Task
          </button>
        </div>
      )}
    </div>
  )
}
