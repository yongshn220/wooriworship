

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseBottomNavBar({ children, height }: Props) {
  return (
    <div>
      <footer 
        className="sticky bottom-0 bg-white border-t z-50"
        style={{ height: `${height}px` }}
      >
        {children}
      </footer>
    </div>
  )
}