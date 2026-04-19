import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../stores/authStore'
import type { AxiosError } from 'axios'

interface LoginErrors {
  email?: string[]
  password?: string[]
}

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      await login(form)
      navigate('/projects')
    } catch (err) {
      const error = err as AxiosError<{ message: string; errors?: LoginErrors }>
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {})
      } else {
        setErrors({ email: [error.response?.data?.message || 'Login failed'] })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-3 text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]
    border border-[var(--color-border-default)] rounded-lg outline-none
    focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-light)]
    placeholder:text-[var(--color-text-muted)] transition-all`

  return (
    <div className="flex items-center justify-center min-h-screen p-4
      bg-[radial-gradient(ellipse_at_20%_50%,rgba(99,102,241,0.08),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.06),transparent_50%)] bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-[400px] bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-10 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] flex items-center justify-center gap-2 mb-2">
            <span className="text-[var(--color-accent)]">◆</span> ProFlow
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-semibold text-[var(--color-text-secondary)]">Email</label>
            <input id="login-email" type="email" name="email" placeholder="you@company.com" value={form.email} onChange={handleChange} autoComplete="email" required className={inputClass} />
            {errors.email && <span className="text-xs text-[var(--color-danger)]">{errors.email[0]}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-sm font-semibold text-[var(--color-text-secondary)]">Password</label>
            <input id="login-password" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password" required className={inputClass} />
            {errors.password && <span className="text-xs text-[var(--color-danger)]">{errors.password[0]}</span>}
          </div>

          <button type="submit" disabled={isLoading} className="w-full mt-2 px-5 py-3 rounded-lg bg-[var(--color-accent)] text-white font-semibold text-sm hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--color-text-muted)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-hover)]">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
