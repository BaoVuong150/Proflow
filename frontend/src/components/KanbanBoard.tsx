import type { Column, Task } from '../types'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useBoardStore } from '../stores/boardStore'

interface KanbanBoardProps {
  columns: Column[]
}

export default function KanbanBoard({ columns }: KanbanBoardProps) {
  const moveTask = useBoardStore((s) => s.moveTask)
  const createColumn = useBoardStore((s) => s.createColumn)
  const board = useBoardStore((s) => s.board)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isCreatingColumn, setIsCreatingColumn] = useState(false)

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !board?.id) {
      setIsAddingColumn(false)
      setNewColumnName('')
      return
    }
    setIsCreatingColumn(true)
    await createColumn(board.id, newColumnName.trim())
    setIsCreatingColumn(false)
    setIsAddingColumn(false)
    setNewColumnName('')
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const setIsDraggingTask = useBoardStore(s => s.setIsDraggingTask)

  const handleDragStart = (event: any) => {
    const { active } = event
    const taskId = parseInt(String(active.id).replace('task-', ''))
    for (const col of columns) {
      const task = col.tasks?.find(t => t.id === taskId)
      if (task) {
        setActiveTask(task)
        setIsDraggingTask(true)
        break
      }
    }
  }

  const handleDragEnd = (event: any) => {
    setActiveTask(null)
    setIsDraggingTask(false)
    const { active, over } = event
    if (!over) return

    const activeId = parseInt(String(active.id).replace('task-', ''))
    const overIdString = String(over.id)
    const isOverColumn = overIdString.startsWith('column-')
    const overIdParsed = parseInt(overIdString.replace('column-', '').replace('task-', ''))

    let sourceColId = -1
    let destColId = -1
    let destIndex = -1

    // Find source column
    for (const col of columns) {
      if (col.tasks?.some(t => t.id === activeId)) {
        sourceColId = col.id
        break
      }
    }

    // Find destination column and index
    if (isOverColumn) {
      destColId = overIdParsed
      const destCol = columns.find(c => c.id === destColId)
      destIndex = destCol?.tasks?.length || 0
    } else {
      for (const col of columns) {
        const idx = col.tasks?.findIndex(t => t.id === overIdParsed) ?? -1
        if (idx !== -1) {
          destColId = col.id
          destIndex = idx
          break
        }
      }
    }

    if (sourceColId === -1 || destColId === -1) return

    // Don't call API if nothing changed
    if (sourceColId === destColId) {
      const sourceIndex = columns.find(c => c.id === sourceColId)?.tasks?.findIndex(t => t.id === activeId) ?? -1
      if (sourceIndex === destIndex) return
    }

    moveTask(activeId, destColId, destIndex)
  }

  const filters = useBoardStore((s) => s.filters)

  // Filter tasks based on current filters
  const filterTasks = (tasks: Task[] | undefined) => {
    if (!tasks) return []
    return tasks.filter(task => {
      let matches = true
      if (filters.priority && task.priority !== filters.priority) matches = false
      if (filters.assigneeId !== null) {
        if (filters.assigneeId === -1) {
          if (task.assignees && task.assignees.length > 0) matches = false
        } else {
          if (!task.assignees?.some(a => a.id === filters.assigneeId)) matches = false
        }
      }
      return matches
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveTask(null)
        setIsDraggingTask(false)
      }}
    >
      {/* 
        Mobile: vertical stack, scroll vertically  
        Tablet+: horizontal row, scroll horizontally 
      */}
      <div className="
        flex flex-col gap-4 items-stretch pb-4
        sm:flex-row sm:items-start sm:h-full
      ">
        {columns.map((column) => (
          <KanbanColumn 
            key={column.id} 
            column={{...column, tasks: filterTasks(column.tasks)}} 
          />
        ))}
        
        {/* Add Column Button */}
        {isAddingColumn ? (
          <div className="
            w-full p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-xl h-fit
            sm:w-[280px] sm:min-w-[280px] sm:shrink-0
            lg:w-[300px] lg:min-w-[300px]
          ">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg p-2 mb-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateColumn()
                if (e.key === 'Escape') {
                  setIsAddingColumn(false)
                  setNewColumnName('')
                }
              }}
              disabled={isCreatingColumn}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateColumn}
                disabled={isCreatingColumn || !newColumnName.trim()}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex-1 disabled:opacity-50"
              >
                {isCreatingColumn ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setIsAddingColumn(false)
                  setNewColumnName('')
                }}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                disabled={isCreatingColumn}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsAddingColumn(true)}
            className="
              w-full h-[52px] bg-[var(--color-bg-tertiary)] border border-dashed border-[var(--color-border-default)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-[var(--color-text-muted)] transition-all font-semibold text-sm
              sm:w-[280px] sm:min-w-[280px] sm:shrink-0
              lg:w-[300px] lg:min-w-[300px]
            "
          >
            + Add Column
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
