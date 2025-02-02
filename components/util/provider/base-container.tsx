export function BaseContainer({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex-center w-full h-full">
      <div className="w-full h-full border-l border-r">
        {children}
      </div>
    </div>
  )
}