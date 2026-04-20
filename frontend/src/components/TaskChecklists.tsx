import { useState, useEffect } from 'react'
import type { Task, Checklist } from '../types'
import { taskFeatureService } from '../services/taskFeatureService'

interface TaskChecklistsProps {
  task: Task
}

export default function TaskChecklists({ task }: TaskChecklistsProps) {
  // If the task already has checklists loaded (from Board API), use them!
  const [checklists, setChecklists] = useState<Checklist[]>(task.checklists || [])
  const [isLoading, setIsLoading] = useState(!task.checklists)
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [newItemContents, setNewItemContents] = useState<Record<number, string>>({})
  const [isAddingList, setIsAddingList] = useState(false)

  const fetchChecklists = async () => {
    try {
      const { data } = await taskFeatureService.getChecklists(task.id)
      setChecklists(data.data)
    } catch (err) {
      console.error('Failed to load checklists:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if they weren't eager loaded
    if (!task.checklists) {
      fetchChecklists()
    } else {
      setChecklists(task.checklists)
    }
  }, [task])

  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return
    try {
      const { data } = await taskFeatureService.createChecklist(task.id, newChecklistTitle)
      setChecklists([...checklists, { ...data.data, items: [] }])
      setNewChecklistTitle('')
      setIsAddingList(false)
    } catch (err) {
      console.error('Failed to create checklist:', err)
    }
  }

  const handleDeleteChecklist = async (checklistId: number) => {
    if (!confirm('Delete this checklist?')) return
    try {
      await taskFeatureService.deleteChecklist(checklistId)
      setChecklists(checklists.filter(c => c.id !== checklistId))
    } catch (err) {
      console.error('Failed to delete checklist:', err)
    }
  }

  const handleAddItem = async (checklistId: number) => {
    const content = newItemContents[checklistId]
    if (!content?.trim()) return
    try {
      const { data } = await taskFeatureService.createChecklistItem(checklistId, content)
      setChecklists(checklists.map(c => {
        if (c.id === checklistId) {
          return { ...c, items: [...(c.items || []), data.data] }
        }
        return c
      }))
      setNewItemContents({ ...newItemContents, [checklistId]: '' })
    } catch (err) {
      console.error('Failed to add checklist item:', err)
    }
  }

  const handleToggleItem = async (itemId: number, checklistId: number, currentStatus: boolean) => {
    try {
      // Optimistic update
      setChecklists(checklists.map(c => {
        if (c.id === checklistId) {
          return {
            ...c,
            items: c.items?.map(i => i.id === itemId ? { ...i, is_completed: !currentStatus } : i)
          }
        }
        return c
      }))
      await taskFeatureService.toggleChecklistItem(itemId, !currentStatus)
    } catch (err) {
      console.error('Failed to toggle item:', err)
      // Revert on failure
      fetchChecklists()
    }
  }

  const handleDeleteItem = async (itemId: number, checklistId: number) => {
    try {
      await taskFeatureService.deleteChecklistItem(itemId)
      setChecklists(checklists.map(c => {
        if (c.id === checklistId) {
          return { ...c, items: c.items?.filter(i => i.id !== itemId) }
        }
        return c
      }))
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }

  if (isLoading) return <div className="animate-pulse h-20 bg-[var(--color-bg-secondary)] rounded-lg"></div>

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Checklists Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          ☑️ Checklists
        </label>
        {!isAddingList && (
          <button 
            onClick={() => setIsAddingList(true)}
            className="text-xs px-3 py-1.5 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] rounded font-semibold transition-colors cursor-pointer"
          >
            + Add Checklist
          </button>
        )}
      </div>

      {isAddingList && (
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newChecklistTitle}
            onChange={e => setNewChecklistTitle(e.target.value)}
            placeholder="Checklist title..."
            className="flex-1 p-2 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded outline-none focus:border-[var(--color-accent)]"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAddChecklist()}
          />
          <button 
            onClick={handleAddChecklist}
            className="px-4 bg-[var(--color-accent)] text-white text-sm font-semibold rounded hover:bg-[var(--color-accent-hover)] cursor-pointer"
          >
            Add
          </button>
          <button 
            onClick={() => setIsAddingList(false)}
            className="px-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Checklists List */}
      <div className="flex flex-col gap-6">
        {checklists.map(checklist => {
          const items = checklist.items || []
          const completedCount = items.filter(i => i.is_completed).length
          const totalCount = items.length
          const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

          return (
            <div key={checklist.id} className="flex flex-col gap-3">
              {/* Checklist Title & Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[var(--color-text-primary)]">{checklist.title}</h4>
                  <button 
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    className="text-[var(--color-text-muted)] hover:text-red-400 text-xs px-2 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold w-8">{progress}%</span>
                  <div className="flex-1 h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? '#22c55e' : 'var(--color-accent)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-1 mt-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 group px-2 py-1.5 hover:bg-[var(--color-bg-secondary)] rounded -mx-2">
                    <input 
                      type="checkbox" 
                      checked={item.is_completed}
                      onChange={() => handleToggleItem(item.id, checklist.id, item.is_completed)}
                      className="w-4 h-4 rounded cursor-pointer accent-[var(--color-accent)]"
                    />
                    <span className={`flex-1 text-sm ${item.is_completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                      {item.content}
                    </span>
                    <button 
                      onClick={() => handleDeleteItem(item.id, checklist.id)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-400 text-sm p-1 cursor-pointer transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add Item Input */}
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="text"
                    value={newItemContents[checklist.id] || ''}
                    onChange={e => setNewItemContents({ ...newItemContents, [checklist.id]: e.target.value })}
                    placeholder="Add an item..."
                    className="flex-1 p-2 text-sm bg-transparent border border-transparent hover:border-[var(--color-border-default)] focus:border-[var(--color-accent)] rounded outline-none transition-colors"
                    onKeyDown={e => e.key === 'Enter' && handleAddItem(checklist.id)}
                  />
                  {newItemContents[checklist.id]?.trim() && (
                    <button 
                      onClick={() => handleAddItem(checklist.id)}
                      className="px-3 py-1.5 bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] text-xs font-semibold rounded hover:bg-[var(--color-bg-hover)] cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
