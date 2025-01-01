

interface Props {
  children: React.ReactNode
  height: number
}

export function BaseTopNavBar({ children, height }: Props) {
  return (
    <div>
      <header
        className="sticky top-0 w-full border-b bg-white z-50"
        style={{ height: `${height}px` }}
      >
        {children}
      </header>
    </div>
  );
}
