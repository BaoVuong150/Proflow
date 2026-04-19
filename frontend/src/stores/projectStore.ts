import { create } from 'zustand'
import { projectService } from '../services/projectService'
import type { Project } from '../types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  fetchProjects: () => Promise<void>
  fetchProject: (id: number | string) => Promise<void>
  createProject: (data: { name: string; description?: string }) => Promise<Project>
  clearCurrentProject: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      const { data } = await projectService.getAll()
      set({ projects: data.data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true })
    try {
      const { data } = await projectService.getById(id)
      set({ currentProject: data.data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createProject: async (projectData) => {
    const { data } = await projectService.create(projectData)
    set((state) => ({ projects: [...state.projects, data.data] }))
    return data.data
  },

  clearCurrentProject: () => set({ currentProject: null }),
}))
