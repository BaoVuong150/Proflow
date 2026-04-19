import { create } from 'zustand'
import api from '../services/api'
import { taskService } from '../services/taskService'
import type { Board, Column, Task, ApiResponse } from '../types'

interface BoardState {
  board: Board | null
  columns: Column[]
  isLoading: boolean
  selectedTask: Task | null
  fetchBoard: (boardId: number) => Promise<void>
  moveTask: (taskId: number, columnId: number, position: number) => Promise<void>
  addTaskToColumn: (columnId: number, task: Task) => void
  setSelectedTask: (task: Task | null) => void
  clearBoard: () => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  columns: [],
  isLoading: false,
  selectedTask: null,

  fetchBoard: async (boardId) => {
    set({ isLoading: true })
    try {
      const { data } = await api.get<ApiResponse<Board>>(`/boards/${boardId}`)
      const board = data.data
      set({
        board,
        columns: board.columns || [],
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
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

      return { columns: newColumns }
    })

    try {
      await taskService.move(taskId, { column_id: columnId, position })
    } catch {
      set({ columns: prevColumns })
    }
  },

  addTaskToColumn: (columnId, task) => {
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: [...(col.tasks || []), task] }
        }
        return col
      })
      return { columns: newColumns }
    })
  },

  setSelectedTask: (task) => set({ selectedTask: task }),

  clearBoard: () => set({ board: null, columns: [], selectedTask: null }),
}))

