import {cn} from "@/lib/utils";

export function MdSidebar({ children, className }: any) {
  return (
    <div className="hidden sm:block w-[170px] h-full lg:w-[206px] ">
      <div className={cn("fixed flex flex-col space-y-6 w-[170px] h-full lg:w-[206px] pl-5 pt-5", className)}>
        {children}
      </div>
    </div>
  )
}
