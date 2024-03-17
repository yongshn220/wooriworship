
export function MdSidebar({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="hidden sm:block w-[170px] h-full lg:w-[206px]">
      <div className="fixed flex flex-col space-y-6 w-[170px] h-full lg:w-[206px] pl-5 pt-5">{children}</div>
    </div>
  )
}
