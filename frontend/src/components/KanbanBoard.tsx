import type { Column, Task } from '../types'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useBoardStore } from '../stores/boardStore'

interface KanbanBoardProps {
  columns: Column[]
}

export default function KanbanBoard({ columns }: KanbanBoardProps) {
  const moveTask = useBoardStore((s) => s.moveTask)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: any) => {
    const { active } = event
    const taskId = active.id

    for (const col of columns) {
      const task = col.tasks?.find(t => t.id === taskId)
      if (task) {
        setActiveTask(task)
        break
      }
    }
  }

  const handleDragEnd = (event: any) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 items-start h-full pb-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
        
        {/* Add Column Button (Placeholder) */}
        <div className="w-[300px] min-w-[300px] h-[52px] bg-[var(--color-bg-tertiary)] border border-dashed border-[var(--color-border-default)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-[var(--color-text-muted)] transition-all font-semibold text-sm shrink-0">
          + Add Column
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
