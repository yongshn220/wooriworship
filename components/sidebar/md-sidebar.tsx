import {cn} from "@/lib/utils";

export function MdSidebar({ children, className }: any) {
  return (
    <div className="hidden sm:flex h-full w-[206px]">
      <div className={cn("fixed flex flex-col space-y-6 h-full w-[206px] px-5 pt-5 border-r", className)}>
        {children}
      </div>
    </div>
  )
}
