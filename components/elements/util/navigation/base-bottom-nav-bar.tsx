

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseBottomNavBar({ children, height }: Props) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] flex justify-center items-end"
      style={{ height: `calc(${height}px + env(safe-area-inset-bottom))` }}
    >
      <nav
        aria-label="Main navigation"
        className="
          w-full h-full
          bg-white dark:bg-panel-dark border-t border-border shadow-sm static-shell
          md:w-auto md:max-w-md md:h-16 md:mb-4 md:rounded-full md:border md:border-border md:shadow-lg
        "
      >
        {children}
      </nav>
    </footer>
  )
}