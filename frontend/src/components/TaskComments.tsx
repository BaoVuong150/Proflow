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
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()

  const fetchComments = async () => {
    try {
      const { data } = await taskFeatureService.getComments(taskId)
      setComments(data.data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
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

  if (isLoading) return <div className="animate-pulse h-20 bg-[var(--color-bg-secondary)] rounded-lg mt-6"></div>

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
      </div>
    </div>
  )
}
