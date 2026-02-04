import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical, DoorOpen, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TeamApi } from "@/apis";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userUpdaterAtom } from "@/global-states/userState";
import { currentTeamIdAtom, teamAtom, teamUpdaterAtom } from "@/global-states/teamState";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/elements/dialog/user-confirmation/confirmation-dialog";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";


export function ManageTeamMenu() {
  const authUser = auth.currentUser
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(currentTeamId))
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const setTeamUpdater = useSetRecoilState(teamUpdaterAtom)
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const [isDeleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false)
  const [isLeaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false)
  const router = useRouter()

  async function handleDeleteTeam() {
    try {
      // TODO: leader 체크는 나중에 firebase rule 안에서도 검증 필요 (보안상)
      if (!team.admins.includes(authUser.uid)) {
        toast({ title: "No Permission", description: `Only Leader can delete team.` }); return;
      }

      if (await TeamApi.deleteTeam(team) === false) {
        console.log("err | TeamApi.deleteTeam")
        toast({ title: "Something went wrong. Please try later again." })
        return;
      }

      /* on success */
      setUserUpdater(prev => prev + 1)
      setTeamUpdater(prev => prev + 1)
      setCurrentTeamId(null)

      toast({ title: `Team [${team.name}] deleted successfully.` })
      router.replace("/")

    }
    catch (err) {
      console.log(err);
      toast({ title: "Something went wrong. Please try later again." })
    }
  }


  async function handleLeaveTeam() {

    if (team.admins.includes(authUser.uid)) {
      toast({ title: "You can't leave the team.", description: 'You are the only leader of this team. Please grant new leader and try again.' })
      return;
    }
    if (await TeamApi.removeMember(authUser.uid, team.id, false) === false) {
      toast({ title: "Something went wrong.", description: "Please contact us." })
    }

    /* on success */
    setUserUpdater(prev => prev + 1)
    setTeamUpdater(prev => prev + 1)
    setCurrentTeamId(null)
    toast({ title: `You leave the team [${team.name}] successfully.` })
    router.replace("/")
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none">
            <EllipsisVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="flex items-center justify-between cursor-pointer" onClick={() => setLeaveTeamDialogOpen(true)}>
            Leave Team
            <DoorOpen className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuItem>
          {
            team.admins.includes(authUser.uid) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
                  onClick={() => setDeleteTeamDialogOpen(true)}
                >
                  Delete Team
                  <Trash2 className="w-4 h-4" />
                </DropdownMenuItem>
              </>
            )
          }
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmationDialog
        isOpen={isDeleteTeamDialogOpen}
        setOpen={setDeleteTeamDialogOpen}
        title="Delete Team"
        description={`Do you really want to delete [${team?.name}]? This action cannot be undone.`}
        onDeleteHandler={handleDeleteTeam}
        callback={() => setDeleteTeamDialogOpen(false)}
      />
      <ConfirmationDialog
        isOpen={isLeaveTeamDialogOpen}
        setOpen={setLeaveTeamDialogOpen}
        title="Leave Team"
        description={`Do you really want to leave team [${team?.name}]? This action cannot be undone.`}
        onDeleteHandler={handleLeaveTeam}
        callback={() => setLeaveTeamDialogOpen(false)}
      />
    </>
  )
}
