import Image from "next/image";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userAtom } from "@/global-states/userState";
import { TeamService } from "@/apis";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { teamAtom, teamUpdaterAtom } from "@/global-states/teamState";
import { auth } from "@/firebase";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";
import { RoleSelect } from "@/components/elements/dialog/manage-team/role-select";

interface Props {
  userId: string
  teamId: string
}

export function InvitedMember({ userId, teamId }: Props) {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(userId))
  const team = useRecoilValue(teamAtom(teamId))
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false)
  const teamUpdater = useSetRecoilState(teamUpdaterAtom)

  async function handleDeleteTeamMember() {
    if (await TeamService.removeMember(user?.id, teamId, false) === false) {
      toast({ title: "Something went wrong. Please try again later." })
      return;
    }

    /* on success */
    teamUpdater(prev => prev + 1)
    toast({ title: "You have successfully remove the member" })
  }

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors">
      <DeleteConfirmationDialog
        isOpen={isOpenDeleteDialog}
        setOpen={setIsOpenDeleteDialog}
        title="Remove Team Member"
        description={`Do you really want to remove [${user?.email}] from your team? This action cannot be undone.`}
        onDeleteHandler={handleDeleteTeamMember}
      />

      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Image alt="user" src="/icons/userIcon.svg" width={16} height={16} className="opacity-70" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.name || "No Name"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
          {/* Mobile-friendly role display if needed, or just let RoleSelect handle it */}
        </div>
      </div>

      <div className="flex-shrink-0 ml-2">
        <RoleSelect role={team?.leaders.includes(user?.id) ? "Leader" : "Member"} />
      </div>
    </div>
  )
}
