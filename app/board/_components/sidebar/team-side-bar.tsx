import {NewButton} from "@/app/board/_components/sidebar/new-button";
import {TeamList} from "@/app/board/_components/sidebar/team-list";


export function TeamSideBar() {
  return (
    <aside className="hidden lg:flex fixed z-[1] left-0 bg-blue-950 h-full w-[60px] p-3 flex-col gap-y-4 text-white">
      <TeamList/>
      <NewButton/>
    </aside>
  )
}
