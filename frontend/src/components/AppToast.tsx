import { useState, useEffect } from 'react'

interface AppToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

function AppToast({ message, type = 'success', onClose, duration = 3000 }: AppToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const borderColor: Record<string, string> = {
    success: 'border-l-[var(--color-success)]',
    error: 'border-l-[var(--color-danger)]',
    info: 'border-l-[var(--color-info)]',
  }

  const iconColor: Record<string, string> = {
    success: 'text-[var(--color-success)]',
    error: 'text-[var(--color-danger)]',
    info: 'text-[var(--color-info)]',
  }

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <div
      className={`fixed top-4 right-4 z-[400] flex items-center gap-3 px-4 py-3 rounded-lg
        bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] border-l-3
        shadow-lg min-w-[280px] max-w-[420px] transition-all duration-300
        ${borderColor[type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}
    >
      <span className={`text-base font-bold ${iconColor[type]}`}>{icon}</span>
      <p className="flex-1 text-sm text-[var(--color-text-primary)]">{message}</p>
      <button
        onClick={onClose}
        className="text-[var(--color-text-muted)] text-lg leading-none p-1 rounded-md
          hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
      >
        ×
      </button>
    </div>
  )
}

export default AppToast
