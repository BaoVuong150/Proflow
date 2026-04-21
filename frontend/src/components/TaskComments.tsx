import { useState, useEffect } from 'react'
import type { Comment } from '../types'
import { taskFeatureService } from '../services/taskFeatureService'
import { useAuthStore } from '../stores/authStore'

interface TaskCommentsProps {
  taskId: number
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()

  const fetchComments = async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true)
    try {
      const { data } = await taskFeatureService.getComments(taskId, pageNum)
      // data.data is the array of comments, data.meta contains pagination info
      if (isLoadMore) {
        setComments(prev => [...prev, ...data.data])
      } else {
        setComments(data.data)
      }
      setHasMore(data.meta.current_page < (data.meta.last_page ?? Math.ceil(data.meta.total / data.meta.per_page)))
      setPage(data.meta.current_page)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchComments(1)
  }, [taskId])

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      const { data } = await taskFeatureService.createComment(taskId, newComment)
      setComments([data.data, ...comments])
      setNewComment('')
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return
    try {
      await taskFeatureService.deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 mt-6 border-t border-[var(--color-border-default)] pt-6">
        <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          💬 Comments
        </label>
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-[var(--color-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 mt-6 border-t border-[var(--color-border-default)] pt-6">
      <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
        💬 Comments
      </label>

      {/* Comment Input */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex shrink-0 items-center justify-center text-xs font-bold text-white uppercase mt-1">
          {user?.name?.substring(0, 2) || 'ME'}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full min-h-[80px] p-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none focus:border-[var(--color-accent)] resize-y transition-colors"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-5 mt-2">
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No comments yet.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex shrink-0 items-center justify-center text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                {comment.user?.name?.substring(0, 2) || '??'}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-sm text-[var(--color-text-primary)]">{comment.user?.name || 'Unknown'}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap bg-[var(--color-bg-secondary)] p-3 rounded-lg rounded-tl-none border border-[var(--color-border-default)] inline-block min-w-[200px]">
                  {comment.content}
                </div>
                {comment.user_id === user?.id && (
                  <div className="mt-1">
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-[var(--color-text-muted)] hover:text-red-400 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => fetchComments(page + 1, true)}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-xs font-semibold rounded hover:bg-[var(--color-border-default)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingMore && (
                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoadingMore ? 'Loading...' : 'Load more comments'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
