import { create } from 'zustand'
import api from '../services/api'
import { taskService } from '../services/taskService'
import type { Board, Column, Task, ApiResponse } from '../types'

const moveTaskTimeouts: Record<number, ReturnType<typeof setTimeout>> = {}
const reorderColumnTimeouts: Record<number, ReturnType<typeof setTimeout>> = {}

interface BoardState {
  board: Board | null
  columns: Column[]
  isLoading: boolean
  error: string | null
  selectedTask: Task | null
  syncingTasks: number[]
  filters: {
    priority: string | null
    assigneeId: number | null
  }
  fetchBoard: (boardId: number) => Promise<void>
  moveTask: (taskId: number, columnId: number, position: number) => Promise<void>
  addTaskToColumn: (columnId: number, task: Task) => void
  updateColumn: (columnId: number, updates: Partial<Column>) => Promise<void>
  deleteColumn: (columnId: number) => Promise<void>
  reorderColumn: (activeId: number, overId: number) => Promise<void>
  createColumn: (boardId: number, name: string) => Promise<void>
  setSelectedTask: (task: Task | null) => void
  setFilters: (filters: Partial<BoardState['filters']>) => void
  clearFilters: () => void
  clearBoard: () => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  columns: [],
  isLoading: false,
  error: null,
  selectedTask: null,
  syncingTasks: [],
  filters: {
    priority: null,
    assigneeId: null,
  },

  fetchBoard: async (boardId) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<ApiResponse<Board>>(`/boards/${boardId}`)
      const board = data.data
      set({
        board,
        columns: board.columns || [],
        isLoading: false,
        error: null
      })
    } catch (err: any) {
      if (err.response?.status === 404) {
        set({ error: 'NOT_FOUND', isLoading: false })
      } else {
        set({ error: 'Failed to load board', isLoading: false })
      }
    }
  },

  moveTask: async (taskId, columnId, position) => {
    const prevColumns = get().columns

    set((state) => {
      const newColumns: Column[] = structuredClone(state.columns)
      let movedTask: Task | null = null

      for (const col of newColumns) {
        const idx = col.tasks?.findIndex((t) => t.id === taskId)
        if (idx !== undefined && idx >= 0 && col.tasks) {
          movedTask = col.tasks.splice(idx, 1)[0]
          break
        }
      }

      if (movedTask) {
        const targetCol = newColumns.find((c) => c.id === columnId)
        if (targetCol) {
          movedTask.column_id = columnId
          if (!targetCol.tasks) targetCol.tasks = []
          targetCol.tasks.splice(position, 0, movedTask)
        }
      }

      return { 
        columns: newColumns,
        syncingTasks: [...state.syncingTasks.filter(id => id !== taskId), taskId]
      }
    })

    if (moveTaskTimeouts[taskId]) {
      clearTimeout(moveTaskTimeouts[taskId])
    }

    moveTaskTimeouts[taskId] = setTimeout(async () => {
      try {
        await taskService.move(taskId, { column_id: columnId, position })
      } catch {
        set({ columns: prevColumns })
      } finally {
        set((state) => ({
          syncingTasks: state.syncingTasks.filter(id => id !== taskId)
        }))
      }
      delete moveTaskTimeouts[taskId]
    }, 500)
  },

  addTaskToColumn: (columnId, task) => {
    set((state) => {
      const newColumns = state.columns.map(col => {
        if (col.id === columnId) {
          return { ...col, tasks: [...(col.tasks || []), task] }
        }
        return col
      })
      return { columns: newColumns }
    })
  },

  updateColumn: async (columnId, updates) => {
    // Optimistic update
    set((state) => ({
      columns: state.columns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      )
    }))
    // Call API (using a dynamic import to avoid circular dependencies if any, but regular import is fine)
    try {
      const { columnService } = await import('../services/columnService')
      await columnService.update(columnId, updates)
    } catch (err) {
      console.error('Failed to update column', err)
      // Ideal: rollback on failure, but keeping it simple for MVP
    }
  },

  deleteColumn: async (columnId) => {
    // Optimistic update
    set((state) => ({
      columns: state.columns.filter(col => col.id !== columnId)
    }))
    try {
      const { columnService } = await import('../services/columnService')
      await columnService.delete(columnId)
    } catch (err) {
      console.error('Failed to delete column', err)
    }
  },

  reorderColumn: async (activeId, overId) => {
    set((state) => {
      const activeIndex = state.columns.findIndex(c => c.id === activeId)
      const overIndex = state.columns.findIndex(c => c.id === overId)
      
      if (activeIndex === -1 || overIndex === -1) return state

      const newColumns = [...state.columns]
      const [movedColumn] = newColumns.splice(activeIndex, 1)
      newColumns.splice(overIndex, 0, movedColumn)

      const boardId = state.board?.id
      if (boardId) {
        if (reorderColumnTimeouts[boardId]) {
          clearTimeout(reorderColumnTimeouts[boardId])
        }

        reorderColumnTimeouts[boardId] = setTimeout(() => {
          import('../services/columnService').then(({ columnService }) => {
            columnService.reorder(boardId, newColumns.map(c => c.id)).catch(err => {
              console.error('Failed to reorder columns', err)
              // Optionally revert to prevColumns here if you saved them
            })
          })
          delete reorderColumnTimeouts[boardId]
        }, 500)
      }

      return { columns: newColumns }
    })
  },

  createColumn: async (boardId, name) => {
    try {
      const { columnService } = await import('../services/columnService')
      const { data } = await columnService.create(boardId, { name })
      set((state) => ({ columns: [...state.columns, data.data] }))
    } catch (err) {
      console.error('Failed to create column', err)
    }
  },

  setSelectedTask: (task) => set({ selectedTask: task }),

  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),

  clearFilters: () => set({ 
    filters: { priority: null, assigneeId: null } 
  }),

  clearBoard: () => set({ board: null, columns: [], selectedTask: null }),
}))
