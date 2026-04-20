import { useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { projectService } from '../services/projectService'
import AppModal from './AppModal'
import AppAvatar from './AppAvatar'

interface ProjectMembersModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
}

export default function ProjectMembersModal({ isOpen, onClose, projectId }: ProjectMembersModalProps) {
  const { currentProject, fetchProject } = useProjectStore()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [isLoading, setIsLoading] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError('')
    try {
      await projectService.addMember(projectId, { email: email.trim(), role })
      setEmail('')
      // Refresh project to get new members
      await fetchProject(projectId.toString())
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member. Make sure the email is registered.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    setRemovingMemberId(userId)
    try {
      await projectService.removeMember(projectId, userId)
      await fetchProject(projectId.toString())
    } catch (err: any) {
      alert('Failed to remove member.')
    } finally {
      setRemovingMemberId(null)
    }
  }

  if (!isOpen || !currentProject) return null

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Project Members">
      <div className="flex flex-col gap-6 w-full max-w-md">
        
        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex flex-col gap-3 bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border-default)]">
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Invite New Member</h4>
          
          <div className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
              required
            />
            <div className="flex gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--color-accent)] hover:bg-blue-600 text-white rounded font-bold text-sm transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </form>

        {/* Member List */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Current Members ({currentProject.members?.length || 0})</h4>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
            {currentProject.members?.map((member, index) => (
              <div key={`modal-member-${member.id}-${index}`} className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-default)] group">
                <div className="flex items-center gap-3">
                  <AppAvatar name={member.name} size="md" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{member.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{member.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] uppercase">
                    {member.pivot?.role || 'member'}
                  </span>
                  {currentProject.owner_id !== member.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingMemberId === member.id}
                      className={`p-1.5 rounded transition-all text-xs font-semibold flex items-center gap-1 ${
                        removingMemberId === member.id 
                          ? 'text-red-400 bg-red-400/10 opacity-100' 
                          : 'text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Remove Member"
                    >
                      {removingMemberId === member.id ? (
                        <>
                          <svg className="animate-spin h-3 w-3 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Removing...
                        </>
                      ) : (
                        '✕'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppModal>
  )
}
