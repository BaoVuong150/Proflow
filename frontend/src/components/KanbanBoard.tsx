import type { Column, Task } from '../types'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
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
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const setIsDraggingTask = useBoardStore(s => s.setIsDraggingTask)

  const handleDragStart = (event: any) => {
    const { active } = event
    
    if (active.data.current?.type === 'Column') {
      const col = columns.find(c => c.id === active.id)
      if (col) setActiveColumn(col)
      return
    }

    const taskId = active.id
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
    setActiveColumn(null)
    setIsDraggingTask(false)
    const { active, over } = event
    if (!over) return

    if (active.data.current?.type === 'Column') {
      if (active.id !== over.id) {
        useBoardStore.getState().reorderColumn(active.id, over.id)
      }
      return
    }

    const activeId = active.id
    const overId = over.id

    let sourceColId = -1
    let destColId = -1
    let destIndex = -1

    for (const col of columns) {
      if (col.tasks?.some(t => t.id === activeId)) {
        sourceColId = col.id
      }
    }

    for (const col of columns) {
      if (col.id === overId) {
        destColId = col.id
        destIndex = col.tasks?.length || 0
        break
      }
      const idx = col.tasks?.findIndex(t => t.id === overId) ?? -1
      if (idx !== -1) {
        destColId = col.id
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
        const modifier = isBelowOverItem ? 1 : 0;
        destIndex = idx + modifier
        break
      }
    }

    if (sourceColId === -1 || destColId === -1) return

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
        setActiveColumn(null)
        setIsDraggingTask(false)
      }}
    >
      <div className="flex gap-4 items-start h-full pb-4">
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={{...column, tasks: filterTasks(column.tasks)}} 
            />
          ))}
        </SortableContext>
        
        {/* Add Column Button */}
        {isAddingColumn ? (
          <div className="w-[300px] min-w-[300px] p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-xl shrink-0 h-fit">
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
            className="w-[300px] min-w-[300px] h-[52px] bg-[var(--color-bg-tertiary)] border border-dashed border-[var(--color-border-default)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-[var(--color-text-muted)] transition-all font-semibold text-sm shrink-0"
          >
            + Add Column
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
        {activeColumn ? (
          <div className="w-[300px] bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-accent)] opacity-80 shadow-2xl overflow-hidden scale-105 transition-transform flex flex-col h-fit max-h-[80vh]">
            <div className="flex items-center gap-2 p-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeColumn.color || 'var(--color-accent)' }} />
              <h3 className="text-sm font-semibold flex-1 text-[var(--color-text-primary)]">{activeColumn.name}</h3>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">
                {activeColumn.tasks?.length || 0}
              </span>
            </div>
            <div className="p-3 opacity-50 pointer-events-none">
              {activeColumn.tasks?.slice(0, 3).map(task => (
                <div key={task.id} className="h-16 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg mb-2 last:mb-0" />
              ))}
              {activeColumn.tasks && activeColumn.tasks.length > 3 && (
                <div className="text-center text-xs text-[var(--color-text-muted)] font-bold mt-2">+{activeColumn.tasks.length - 3} more tasks</div>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
