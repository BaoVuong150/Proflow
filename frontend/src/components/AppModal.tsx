import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function AppModal({ isOpen, onClose, title, children, size = 'md' }: AppModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full ${sizeClasses[size]} bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {title ? (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-default)]">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
