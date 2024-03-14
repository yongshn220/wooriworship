import {NewButton} from "@/app/board/_components/team-sidebar/new-button";
import {List} from "@/app/board/_components/team-sidebar/list";


export function TeamSidebar() {
  return (
    <aside className="hidden lg:flex items-center fixed z-[1] left-0 bg-blue-950 h-full w-[60px] p-3 flex-col gap-y-4 text-white">
      <List/>
      <NewButton/>
    </aside>
  )
}
