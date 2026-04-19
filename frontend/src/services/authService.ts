import api from './api'
import type { ApiResponse, User } from '../types'

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<User>>('/auth/login', credentials),
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post<ApiResponse<User>>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get<ApiResponse<User>>('/auth/user'),
}
