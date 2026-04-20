import { useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useProjectStore } from '../stores/projectStore'
import { useBoardStore } from '../stores/boardStore'
import AppHeader from '../components/AppHeader'
import KanbanBoard from '../components/KanbanBoard'
import TaskDetailModal from '../components/TaskDetailModal'

function BoardPage() {
  const { projectId, boardId } = useParams()
  const { currentProject, fetchProject } = useProjectStore()
  const { columns, isLoading, fetchBoard, selectedTask, setSelectedTask } = useBoardStore()

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
      />

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
    </div>
  )
}

export default BoardPage
