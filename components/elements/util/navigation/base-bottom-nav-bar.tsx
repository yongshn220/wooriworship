

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseBottomNavBar({ children, height }: Props) {
  return (
    <div>
      <footer
        className="relative bg-background/80 backdrop-blur-md border-t border-border shadow-sm z-50 transition-all duration-300 pb-[env(safe-area-inset-bottom)] static-shell"
        style={{ height: `calc(${height}px + env(safe-area-inset-bottom))` }}
      >
        {children}
      </footer>
    </div>
  )
}