import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { useProjectStore } from '../stores/projectStore'
import { useBoardStore } from '../stores/boardStore'
import AppHeader from '../components/AppHeader'
import KanbanBoard from '../components/KanbanBoard'
import TaskDetailModal from '../components/TaskDetailModal'
import ProjectActivitySidebar from '../components/ProjectActivitySidebar'
import BoardFilterBar from '../components/BoardFilterBar'
import ProjectMembersModal from '../components/ProjectMembersModal'

function BoardPage() {
  const { projectId, boardId } = useParams()
  const { currentProject, fetchProject } = useProjectStore()
  const { columns, isLoading, fetchBoard, selectedTask, setSelectedTask } = useBoardStore()
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)

  // Parallel fetching
  useEffect(() => {
    if (projectId) fetchProject(projectId)
    if (boardId) fetchBoard(Number(boardId))
  }, [projectId, boardId, fetchProject, fetchBoard])

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] overflow-hidden">
      <AppHeader 
        title={
          <div className="flex items-center gap-2">
            <Link 
              to="/projects" 
              className="p-1 -ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors flex items-center justify-center cursor-pointer"
              title="Back to Projects"
            >
              ←
            </Link>
            <span className="font-bold text-base">{currentProject?.name || 'Loading Project...'}</span>
          </div>
        } 
      >
        <button 
          onClick={() => setIsMembersOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors cursor-pointer border border-[var(--color-border-default)]"
          title="Manage Project Members"
        >
          👥 Members ({currentProject?.members?.length || 0})
        </button>

        <button 
          onClick={() => setIsActivityOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors cursor-pointer border border-[var(--color-border-default)]"
        >
          ⏱️ Activity
        </button>
      </AppHeader>

      {/* Filter Bar */}
      <BoardFilterBar />

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[var(--color-text-muted)]">Loading board...</div>
          </div>
        ) : (
          <KanbanBoard columns={columns} />
        )}
      </main>

      {selectedTask && (
        <TaskDetailModal 
          isOpen={true} 
          onClose={() => setSelectedTask(null)} 
          task={selectedTask} 
        />
      )}

      {projectId && (
        <>
          <ProjectActivitySidebar 
            projectId={Number(projectId)} 
            isOpen={isActivityOpen} 
            onClose={() => setIsActivityOpen(false)} 
          />
          <ProjectMembersModal 
            projectId={Number(projectId)} 
            isOpen={isMembersOpen} 
            onClose={() => setIsMembersOpen(false)} 
          />
        </>
      )}
    </div>
  )
}

export default BoardPage
