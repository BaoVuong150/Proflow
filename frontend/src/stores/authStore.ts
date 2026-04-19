import { create } from 'zustand'
import { authService } from '../services/authService'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  fetchUser: () => Promise<void>
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchUser: async () => {
    try {
      const { data } = await authService.getUser()
      set({ user: data.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (credentials) => {
    const { data } = await authService.login(credentials)
    set({ user: data.data, isAuthenticated: true })
  },

  register: async (formData) => {
    const { data } = await authService.register(formData)
    set({ user: data.data, isAuthenticated: true })
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, isAuthenticated: false })
  },
}))
