import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProjectStore } from '../stores/projectStore'
import AppHeader from '../components/AppHeader'
import AppSidebar from '../components/AppSidebar'
import AppModal from '../components/AppModal'

function ProjectListPage() {
  const { projects, isLoading, fetchProjects, createProject } = useProjectStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newProjectForm, setNewProjectForm] = useState({ name: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

    const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await createProject(newProjectForm)
      setIsCreateModalOpen(false)
      setNewProjectForm({ name: '', description: '' })
    } catch (err: any) {
      // BẮT LỖI TỪ API QUĂNG VỀ (Bao gồm lỗi 403 từ Service)
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Có lỗi xảy ra khi tạo dự án!");
      }
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      <AppHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar 
          projects={projects} 
          onCreateProject={() => setIsCreateModalOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">My Projects</h2>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>+</span> New Project
              </button>
            </div>

            {isLoading ? (
              <div className="text-center text-[var(--color-text-muted)] py-16">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-24 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl">
                <p className="text-6xl mb-4">📁</p>
                <p className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No projects yet</p>
                <p className="text-[var(--color-text-muted)] mb-6">Create your first project to organize your tasks.</p>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-semibold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span>+</span> Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={project.boards?.[0] ? `/projects/${project.id}/boards/${project.boards[0].id}` : `/projects/${project.id}`}
                    className="group bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-xl overflow-hidden hover:border-[var(--color-accent)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 no-underline flex flex-col h-full"
                  >
                    <div className="h-1.5 w-full transition-all duration-300 group-hover:h-2" style={{ background: project.color || 'var(--color-accent)' }} />
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">{project.name}</h3>
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 flex-1">{project.description || 'No description provided.'}</p>
                      
                      <div className="mt-6 pt-4 border-t border-[var(--color-border-default)] flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--color-bg-tertiary)] rounded-full text-[var(--color-text-secondary)]">
                          {project.visibility || 'Private'}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          Updated {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <AppModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="project-name" className="text-sm font-semibold text-[var(--color-text-secondary)]">Project Name</label>
            <input 
              id="project-name" 
              type="text" 
              placeholder="e.g. Website Redesign" 
              value={newProjectForm.name} 
              onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} 
              required 
              className="w-full px-4 py-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)] transition-all" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="project-desc" className="text-sm font-semibold text-[var(--color-text-secondary)]">Description (Optional)</label>
            <textarea 
              id="project-desc" 
              rows={3}
              placeholder="What is this project about?" 
              value={newProjectForm.description} 
              onChange={e => setNewProjectForm({...newProjectForm, description: e.target.value})} 
              className="w-full px-4 py-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)] transition-all resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </AppModal>
    </div>
  )
}

export default ProjectListPage
