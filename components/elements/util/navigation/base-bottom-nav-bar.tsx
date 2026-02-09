

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseBottomNavBar({ children, height }: Props) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] flex justify-center items-end px-6 pb-6"
    >
      <nav
        aria-label="Main navigation"
        className="
          w-full max-w-sm
          bg-background/70 dark:bg-panel-dark/70
          backdrop-blur-2xl
          border border-white/20 dark:border-white/10
          shadow-[0_10px_40px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.08)]
          rounded-full
          static-shell
          overflow-hidden
        "
        style={{ height: `${height}px` }}
      >
        {children}
      </nav>
    </footer>
  )
}