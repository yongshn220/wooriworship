import {NewButton} from "@/app/board/_components/team-sidebar/new-button";
import {List} from "@/app/board/_components/team-sidebar/list";


export function TeamSidebar() {
  console.log("Team Side Bar")
  return (
    <aside className="hidden lg:flex items-center fixed z-[1] left-0 h-full w-[60px] p-3 flex-col gap-y-4 text-white shadow-lg">
      <List/>
      <NewButton/>
    </aside>
  )
}
