

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseBottomNavBar({ children, height }: Props) {
  return (
    <footer
      className="relative shrink-0 bg-background/80 backdrop-blur-md border-t border-border shadow-sm z-10 static-shell pb-[env(safe-area-inset-bottom)]"
      style={{ height: `calc(${height}px + env(safe-area-inset-bottom))` }}
    >
      <nav aria-label="Main navigation" className="h-full">
        {children}
      </nav>
    </footer>
  )
}