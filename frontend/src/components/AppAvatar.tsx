import { useMemo } from 'react'

interface AppAvatarProps {
  name?: string
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AppAvatar({ name = 'User', imageUrl, size = 'md', className = '' }: AppAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const initials = useMemo(() => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }, [name])

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold uppercase border border-[var(--color-border-default)] ${sizeClasses[size]} ${className}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
