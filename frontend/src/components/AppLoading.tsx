function AppLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-10 h-10">
        <div className="w-full h-full border-3 border-[var(--color-border-default)] border-t-[var(--color-accent)] rounded-full animate-spin-slow" />
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
    </div>
  )
}

export default AppLoading
