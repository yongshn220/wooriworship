import {CreateNewTeamDialog} from "@/app/board/_components/create-new-team-dialog";
import {UsersIcon} from "lucide-react";


export function CreateTeamButton() {
  return (
    <CreateNewTeamDialog>
      <div className="flex-center flex-col space-y-1 cursor-pointer">
        <div className="flex-center w-20 h-20 bg-gray-300 rounded-lg">
          <UsersIcon/>
        </div>
        <p className="text-sm">Team</p>
      </div>
    </CreateNewTeamDialog>
  )
}
