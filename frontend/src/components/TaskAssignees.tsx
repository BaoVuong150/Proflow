import { useState, useRef, useEffect } from 'react'
import type { User, ProjectMember } from '../types'
import { taskService } from '../services/taskService'
import { useBoardStore } from '../stores/boardStore'
import { useProjectStore } from '../stores/projectStore'
import AppAvatar from './AppAvatar'

interface TaskAssigneesProps {
  taskId: number
  assignees: User[]
}

export default function TaskAssignees({ taskId, assignees }: TaskAssigneesProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { currentProject } = useProjectStore()
  const projectMembers: ProjectMember[] = currentProject?.members || []

  // Members not yet assigned (compare user_id from ProjectMember with id from User)
  const availableMembers = projectMembers.filter(
    (member) => !assignees.some((a) => a.id === member.user_id)
  )

  const filteredMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isDropdownOpen])

  const updateTaskInStore = (newAssignees: User[]) => {
    useBoardStore.setState((state) => ({
      columns: state.columns.map((col) => ({
        ...col,
        tasks: col.tasks?.map((t) =>
          t.id === taskId ? { ...t, assignees: newAssignees } : t
        ),
      })),
      selectedTask: state.selectedTask?.id === taskId
        ? { ...state.selectedTask, assignees: newAssignees }
        : state.selectedTask,
    }))
  }

  const handleAssign = async (member: ProjectMember) => {
    setIsLoading(member.user_id)
    try {
      await taskService.assign(taskId, member.user_id)
      // Convert ProjectMember to User shape for store
      const newUser: User = {
        id: member.user_id,
        name: member.name,
        email: member.email,
        created_at: '',
        updated_at: '',
      }
      const newAssignees = [...assignees, newUser]
      updateTaskInStore(newAssignees)
    } catch (err) {
      console.error('Failed to assign user:', err)
    } finally {
      setIsLoading(null)
    }
  }

  const handleUnassign = async (user: User) => {
    setIsLoading(user.id)
    try {
      await taskService.unassign(taskId, user.id)
      const newAssignees = assignees.filter((a) => a.id !== user.id)
      updateTaskInStore(newAssignees)
    } catch (err) {
      console.error('Failed to unassign user:', err)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
        👥 Assignees
      </label>

      {/* Current Assignees */}
      <div className="flex flex-col gap-1.5">
        {assignees.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg px-2.5 py-1.5 group/assignee"
          >
            <AppAvatar name={user.name} size="sm" className="!w-6 !h-6 !text-[9px]" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-text-primary)] truncate block">
                {user.name}
              </span>
            </div>
            <button
              onClick={() => handleUnassign(user)}
              disabled={isLoading === user.id}
              className="opacity-0 group-hover/assignee:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded transition-all cursor-pointer disabled:opacity-50"
              title={`Remove ${user.name}`}
            >
              {isLoading === user.id ? (
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Add Assignee Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg border border-dashed transition-colors cursor-pointer
            ${isDropdownOpen
              ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
              : 'border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }
          `}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-[var(--color-border-default)]">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full text-xs bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded px-2 py-1.5 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Member List */}
            <div className="max-h-[180px] overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-[var(--color-text-muted)] italic">
                  {availableMembers.length === 0
                    ? 'All members assigned'
                    : 'No members found'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.user_id}
                    onClick={() => handleAssign(member)}
                    disabled={isLoading === member.user_id}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer disabled:opacity-50 text-left"
                  >
                    <AppAvatar name={member.name} size="sm" className="!w-6 !h-6 !text-[9px]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {member.email}
                      </div>
                    </div>
                    {isLoading === member.user_id && (
                      <svg className="animate-spin h-3.5 w-3.5 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
