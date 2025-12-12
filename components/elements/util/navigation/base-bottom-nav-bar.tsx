

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseBottomNavBar({ children, height }: Props) {
  return (
    <div>
      <footer
        className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border shadow-sm z-50 transition-all duration-300"
        style={{ height: `${height}px` }}
      >
        {children}
      </footer>
    </div>
  )
}