import api from './api'
import type { Checklist, ChecklistItem, Comment } from '../types'

export const taskFeatureService = {
  // --- Checklists ---
  getChecklists: (taskId: number) => api.get(`/tasks/${taskId}/checklists`),
  createChecklist: (taskId: number, title: string) => api.post(`/tasks/${taskId}/checklists`, { title }),
  updateChecklist: (checklistId: number, title: string) => api.put(`/checklists/${checklistId}`, { title }),
  deleteChecklist: (checklistId: number) => api.delete(`/checklists/${checklistId}`),

  // --- Checklist Items ---
  createChecklistItem: (checklistId: number, content: string) => api.post(`/checklists/${checklistId}/items`, { content }),
  updateChecklistItem: (itemId: number, content: string) => api.put(`/checklist-items/${itemId}`, { content }),
  toggleChecklistItem: (itemId: number, is_completed: boolean) => api.put(`/checklist-items/${itemId}/toggle`, { is_completed }),
  deleteChecklistItem: (itemId: number) => api.delete(`/checklist-items/${itemId}`),

  // --- Comments ---
  getComments: (taskId: number) => api.get(`/tasks/${taskId}/comments`),
  createComment: (taskId: number, content: string) => api.post(`/tasks/${taskId}/comments`, { content }),
  deleteComment: (commentId: number) => api.delete(`/comments/${commentId}`),

  // --- Attachments ---
  getAttachments: (taskId: number) => api.get(`/tasks/${taskId}/attachments`),
  uploadAttachment: (taskId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteAttachment: (attachmentId: number) => api.delete(`/attachments/${attachmentId}`),

  // --- Activities ---
  getTaskActivities: (projectId: number, taskId: number) => 
    api.get(`/projects/${projectId}/activity?loggable_type=App\\Models\\Task&loggable_id=${taskId}`),
}
