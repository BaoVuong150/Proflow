import type { ReactNode } from 'react'

type BadgeVariant = 'low' | 'medium' | 'high' | 'urgent' | 'open' | 'in_progress' | 'review' | 'done' | 'closed' | 'default'

interface AppBadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export default function AppBadge({ variant = 'default', children, className = '' }: AppBadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    low: 'bg-[rgba(34,197,94,0.15)] text-[var(--color-priority-low)]',
    medium: 'bg-[rgba(245,158,11,0.15)] text-[var(--color-priority-medium)]',
    high: 'bg-[rgba(249,115,22,0.15)] text-[var(--color-priority-high)]',
    urgent: 'bg-[rgba(239,68,68,0.15)] text-[var(--color-priority-urgent)]',
    open: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]',
    in_progress: 'bg-[rgba(59,130,246,0.15)] text-[var(--color-info)]',
    review: 'bg-[rgba(168,85,247,0.15)] text-purple-400',
    done: 'bg-[rgba(34,197,94,0.15)] text-[var(--color-success)]',
    closed: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]',
    default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border border-[var(--color-border-default)] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
