import {CreateNewTeamDialog} from "@/app/board/_components/create-new-team-dialog";
import {List} from "@/app/board/_components/team-sidebar/list";
import {Plus} from "lucide-react";
import {Hint} from "@/components/hint";

export function TeamSidebar() {

  return (
    <aside className="hidden lg:flex items-center fixed z-[1] left-0 h-full w-[60px] p-3 flex-col gap-y-4 text-white shadow-lg">
      <List/>
      <CreateNewTeamDialog>
        <Hint label="Create Team" side="right" align="start" sideOffset={18}>
          <button
            className="bg-blue-500/50 h-[40px] w-[40px] rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition"
          >
            <Plus className="text-white"></Plus>
          </button>
        </Hint>
      </CreateNewTeamDialog>
    </aside>
  )
}
