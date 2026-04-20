import api from './api'
import type { ApiResponse, Project } from '../types'

export const projectService = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getById: (id: number | string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) => api.post<ApiResponse<Project>>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put<ApiResponse<Project>>(`/projects/${id}`, data),
  destroy: (id: number) => api.delete(`/projects/${id}`),
  addMember: (projectId: number, data: { email: string; role?: string }) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId: number, userId: number) => api.delete(`/projects/${projectId}/members/${userId}`),
  getProjectActivities: (projectId: number, page: number = 1) => api.get(`/projects/${projectId}/activity?page=${page}`),
}
