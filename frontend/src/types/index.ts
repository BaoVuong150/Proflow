// ==========================================
// ProFlow — Shared TypeScript Types
// ==========================================

export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  owner_id: number
  visibility: 'private' | 'team' | 'public'
  color: string | null
  icon: string | null
  is_archived: boolean
  boards?: Board[]
  created_at: string
  updated_at: string
}

export interface Board {
  id: number
  project_id: number
  name: string
  columns?: Column[]
}

export interface Column {
  id: number
  board_id: number
  name: string
  color: string | null
  position: number
  wip_limit: number | null
  is_done_column: boolean
  tasks?: Task[]
}

export interface Task {
  id: number
  title: string
  description: string | null
  project_id: number
  column_id: number
  reporter_id: number
  position: number
  type: 'task' | 'bug' | 'feature' | 'improvement' | null
  status: 'open' | 'in_progress' | 'review' | 'done' | 'closed' | null
  priority: 'low' | 'medium' | 'high' | 'urgent' | null
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  estimated_hours: number | null
  actual_hours: number | null
  is_archived: boolean
  assignees?: User[]
  labels?: Label[]
  created_at: string
  updated_at: string
}

export interface Label {
  id: number
  project_id: number
  name: string
  color: string
}

export interface Comment {
  id: number
  task_id: number
  user_id: number
  content: string
  user?: User
  created_at: string
}

export interface ActivityLog {
  id: number
  user_id: number
  project_id: number
  action: string
  description: string
  user?: User
  created_at: string
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: {
    timestamp: string
    current_page?: number
    per_page?: number
    total?: number
  }
}
