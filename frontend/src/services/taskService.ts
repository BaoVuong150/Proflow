import api from './api'
import type { ApiResponse, Task } from '../types'

export const taskService = {
  create: (projectId: number, data: { title: string; column_id: number; [key: string]: unknown }) =>
    api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data),
  getById: (id: number) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  update: (id: number, data: Partial<Task>) => api.put<ApiResponse<Task>>(`/tasks/${id}`, data),
  destroy: (id: number) => api.delete(`/tasks/${id}`),
  move: (id: number, data: { column_id: number; position: number }) => api.post(`/tasks/${id}/move`, data),
  assign: (id: number, userId: number) => api.post(`/tasks/${id}/assign`, { user_id: userId }),
  unassign: (id: number, userId: number) => api.delete(`/tasks/${id}/assign/${userId}`),
  attachLabel: (id: number, labelId: number) => api.post(`/tasks/${id}/labels`, { label_id: labelId }),
  detachLabel: (id: number, labelId: number) => api.delete(`/tasks/${id}/labels/${labelId}`),

  getChecklists: (taskId: number) => api.get(`/tasks/${taskId}/checklists`),
  createChecklist: (taskId: number, data: { title: string }) => api.post(`/tasks/${taskId}/checklists`, data),

  getComments: (taskId: number) => api.get(`/tasks/${taskId}/comments`),
  createComment: (taskId: number, data: { content: string }) => api.post(`/tasks/${taskId}/comments`, data),
  deleteComment: (commentId: number) => api.delete(`/comments/${commentId}`),

  getAttachments: (taskId: number) => api.get(`/tasks/${taskId}/attachments`),
  uploadAttachment: (taskId: number, formData: FormData) =>
    api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (attachmentId: number) => api.delete(`/attachments/${attachmentId}`),
}
