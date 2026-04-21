import React, { useEffect, useState, Suspense } from 'react'
import { useParams, Link, Navigate } from 'react-router'
import { useProjectStore } from '../stores/projectStore'
import { useBoardStore } from '../stores/boardStore'
import AppHeader from '../components/AppHeader'
import KanbanBoard from '../components/KanbanBoard'
import BoardFilterBar from '../components/BoardFilterBar'

const TaskDetailModal = React.lazy(() => import('../components/TaskDetailModal'))
const ProjectActivitySidebar = React.lazy(() => import('../components/ProjectActivitySidebar'))
const ProjectMembersModal = React.lazy(() => import('../components/ProjectMembersModal'))

function BoardPage() {
  const { projectId, boardId } = useParams()
  const { currentProject, fetchProject, error: projectError } = useProjectStore()
  const { columns, isLoading, fetchBoard, selectedTask, setSelectedTask, error: boardError } = useBoardStore()
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)

  // Redirect if ID formats are invalid or APIs return 404
  const isInvalidFormat = isNaN(Number(projectId)) || isNaN(Number(boardId))
  const isNotFound = projectError === 'NOT_FOUND' || boardError === 'NOT_FOUND' || isInvalidFormat

  // Parallel fetching
  useEffect(() => {
    if (isInvalidFormat) return
    if (projectId) fetchProject(projectId)
    if (boardId) fetchBoard(Number(boardId))
  }, [projectId, boardId, fetchProject, fetchBoard, isInvalidFormat])

  // Real-time Sync (Epic 8)
  useEffect(() => {
    if (isInvalidFormat || !boardId) return;

    let channel: any;

    import('../services/echoService').then(({ default: echo }) => {
      channel = echo.private(`board.${boardId}`);

      channel.listen('TaskCreated', (e: any) => {
        useBoardStore.getState().handleTaskCreated(e.task);
      });

      channel.listen('TaskUpdated', (e: any) => {
        useBoardStore.getState().handleTaskUpdated(e.task);
      });

      channel.listen('TaskDeleted', (e: any) => {
        useBoardStore.getState().handleTaskDeleted(e.taskId);
      });

      channel.listen('TaskMoved', (e: any) => {
        useBoardStore.getState().handleTaskMoved(e.task, e.oldColumnId);
      });

      channel.on('pusher:subscription_succeeded', () => {
        // Handle Edge Case 5: Silent disconnect reconnect
        // Fetch board again to ensure data is fresh
        fetchBoard(Number(boardId));
      });
    }).catch(err => console.error("Failed to load Echo", err));

    return () => {
      if (channel) {
        import('../services/echoService').then(({ default: echo }) => {
          echo.leave(`board.${boardId}`);
        });
      }
    };
  }, [boardId, isInvalidFormat, fetchBoard]);

  if (isNotFound) {
    return <Navigate to="/404" replace />
  }

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

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  )
}

export default BoardPage
