import AppModal from './AppModal'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: React.ReactNode
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false
}: ConfirmModalProps) {
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-6">
        <p className="text-[var(--color-text-secondary)]">
          {message}
        </p>
        
        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm cursor-pointer ${
              danger 
                ? 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500/50' 
                : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/50'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </AppModal>
  )
}
