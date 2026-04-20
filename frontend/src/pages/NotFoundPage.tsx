import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-primary)] p-6 text-center">
      <div className="text-[120px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-purple-500 animate-pulse">
        404
      </div>
      <h1 className="mt-6 text-3xl font-bold text-[var(--color-text-primary)]">
        Oops! Page not found
      </h1>
      <p className="mt-4 text-base text-[var(--color-text-secondary)] max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link 
        to="/" 
        className="mt-10 px-8 py-3 bg-[var(--color-accent)] hover:bg-blue-600 text-white font-bold rounded-lg transition-transform hover:scale-105 shadow-lg shadow-blue-500/30"
      >
        Go Back Home
      </Link>
    </div>
  )
}
