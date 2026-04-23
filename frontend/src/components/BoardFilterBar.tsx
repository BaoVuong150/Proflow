import { useBoardStore } from '../stores/boardStore'
import { useProjectStore } from '../stores/projectStore'
import AppAvatar from './AppAvatar'

export default function BoardFilterBar() {
  const { filters, setFilters, clearFilters } = useBoardStore()
  const { currentProject } = useProjectStore()

  const activeFiltersCount = (filters.priority ? 1 : 0) + (filters.assigneeId ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-default)] shrink-0 overflow-x-auto hide-scrollbar">
      <span className="text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-1 shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </span>

      <div className="w-px h-5 bg-[var(--color-border-default)] mx-1 shrink-0"></div>

      {/* Assignee Filter */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-[var(--color-text-muted)] font-medium">Assignee:</span>
        <div className="flex -space-x-2">
          {currentProject?.members?.map((member, index) => (
            <button
              key={`member-${member.user_id}-${index}`}
              onClick={() => setFilters({ assigneeId: filters.assigneeId === member.user_id ? null : member.user_id })}
              className={`relative rounded-full transition-transform hover:z-10 hover:scale-110 ${
                filters.assigneeId === member.user_id 
                  ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-primary)] z-10' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              title={member.name}
            >
              <AppAvatar name={member.name} size="sm" />
            </button>
          ))}
          <button
            onClick={() => setFilters({ assigneeId: filters.assigneeId === -1 ? null : -1 })}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-bg-secondary)] border border-dashed border-[var(--color-border-default)] text-xs transition-transform hover:z-10 hover:scale-110 ${
              filters.assigneeId === -1
                ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-primary)] z-10 text-[var(--color-text-primary)]' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
            title="Unassigned"
          >
            ?
          </button>
        </div>
      </div>

      <div className="w-px h-5 bg-[var(--color-border-default)] mx-2 shrink-0"></div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-[var(--color-text-muted)] font-medium">Priority:</span>
        <select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ priority: e.target.value || null })}
          className="text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded px-2 py-1 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All Priorities</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
          <option value="urgent">🔥 Urgent</option>
        </select>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <button
          onClick={clearFilters}
          className="ml-2 text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-400/10 transition-colors shrink-0"
        >
          Clear All ({activeFiltersCount})
        </button>
      )}
    </div>
  )
}
