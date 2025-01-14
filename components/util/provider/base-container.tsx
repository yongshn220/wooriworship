export function BaseContainer({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex-center w-full h-full">
      <div className="w-full h-full max-w-5xl border-l border-r">
        {children}
      </div>
    </div>
  )
}