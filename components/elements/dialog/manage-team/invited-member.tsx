import Image from "next/image";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {userAtom} from "@/global-states/userState";
import { TeamService } from "@/apis";
import {useState} from "react";
import {toast} from "@/components/ui/use-toast";
import {teamAtom, teamUpdaterAtom} from "@/global-states/teamState";
import {auth} from "@/firebase";
import {DeleteConfirmationDialog} from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import {RoleSelect} from "@/components/elements/dialog/manage-team/role-select";

interface Props {
  userId: string
  teamId: string
}

export function InvitedMember({userId, teamId}: Props) {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(userId))
  const team = useRecoilValue(teamAtom(teamId))
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false)
  const teamUpdater = useSetRecoilState(teamUpdaterAtom)

  async function handleDeleteTeamMember() {
    if (await TeamService.removeMember(user?.id, teamId, false) === false) {
      toast({title: "Something went wrong. Please try again later."})
      return;
    }

    /* on success */
    teamUpdater(prev => prev + 1)
    toast({title: "You have successfully remove the member"})
  }

  return (
    <div className="w-full flex-start flex-col sm:flex-row sm:items-center gap-4 my-3 py-1 px-2 bg-gray-100 rounded-lg">
      <DeleteConfirmationDialog
        isOpen={isOpenDeleteDialog}
        setOpen={setIsOpenDeleteDialog}
        title="Remove Team Member"
        description={`Do you really want to remove [${user?.email}] from your team? This action cannot be undone.`}
        onDeleteHandler={handleDeleteTeamMember}
      />
      <div className="flex-1 flex-between gap-2">
        <div className="flex gap-2">
          <Image alt="mail icon" src="/icons/userIcon.svg" width={20} height={20}/>
          <p className="flex-1 text-sm">
            {user?.email}
          </p>
        </div>
      </div>
      <div className="w-full sm:w-[160px]">
        <RoleSelect role={team?.leaders.includes(user?.id) ? "Leader" : "Member"}/>
      </div>
    </div>
  )
}
