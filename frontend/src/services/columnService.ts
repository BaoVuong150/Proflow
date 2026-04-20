import api from './api'
import type { ApiResponse, Column } from '../types'

export const columnService = {
  create: (boardId: number, data: { name: string; position?: number; color?: string }) => 
    api.post<ApiResponse<Column>>(`/boards/${boardId}/columns`, data),
    
  update: (columnId: number, data: { name?: string; position?: number; color?: string }) => 
    api.put<ApiResponse<Column>>(`/columns/${columnId}`, data),
    
  delete: (columnId: number) => 
    api.delete(`/columns/${columnId}`),
    
  reorder: (boardId: number, columnIds: number[]) => 
    api.put(`/boards/${boardId}/columns/reorder`, { column_ids: columnIds })
}
