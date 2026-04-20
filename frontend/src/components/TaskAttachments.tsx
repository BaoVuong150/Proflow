import { useState, useEffect, useRef } from 'react'
import type { Attachment } from '../types'
import { taskFeatureService } from '../services/taskFeatureService'

interface TaskAttachmentsProps {
  taskId: number
}

export default function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAttachments = async () => {
    try {
      const { data } = await taskFeatureService.getAttachments(taskId)
      setAttachments(data.data)
    } catch (err) {
      console.error('Failed to load attachments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { data } = await taskFeatureService.uploadAttachment(taskId, file)
      setAttachments([...attachments, data.data])
    } catch (err) {
      console.error('Failed to upload attachment:', err)
      alert('Upload failed. File might be too large (max 10MB).')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (attachmentId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await taskFeatureService.deleteAttachment(attachmentId)
      setAttachments(attachments.filter(a => a.id !== attachmentId))
    } catch (err) {
      console.error('Failed to delete attachment:', err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-6 border-t border-[var(--color-border-default)] pt-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
            📎 Attachments
          </label>
        </div>
        <div className="animate-pulse h-16 bg-[var(--color-bg-secondary)] rounded-lg w-full"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 mt-6 border-t border-[var(--color-border-default)] pt-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          📎 Attachments
        </label>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs px-3 py-1.5 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] rounded font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : '+ Add File'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect}
        />
      </div>

      <div className="flex flex-col gap-2">
        {attachments.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-2 bg-[var(--color-bg-secondary)] rounded-lg border border-dashed border-[var(--color-border-default)]">No attachments yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg group hover:border-[var(--color-accent)] transition-colors">
                <div className="w-10 h-10 rounded bg-[var(--color-bg-elevated)] flex shrink-0 items-center justify-center text-[var(--color-text-muted)] font-bold text-xs uppercase">
                  {file.original_name.split('.').pop()?.substring(0, 4) || 'FILE'}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <a 
                    href={file.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-bold text-[var(--color-text-primary)] truncate hover:text-[var(--color-accent)] hover:underline"
                    title={file.original_name}
                  >
                    {file.original_name}
                  </a>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded transition-all cursor-pointer"
                  title="Delete file"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
