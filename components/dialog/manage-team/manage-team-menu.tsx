import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {DoorOpenIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";
import {TeamService} from "@/apis";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {userUpdaterAtom} from "@/global-states/userState";
import {currentTeamIdAtom, teamAtom, teamUpdaterAtom} from "@/global-states/teamState";
import {auth} from "@/firebase";
import {useRouter} from "next/navigation";
import {DeleteConfirmationDialog} from "@/components/dialog/user-confirmation/delete-confirmation-dialog";
import {ConfirmationDialog} from "@/components/dialog/user-confirmation/confirmation-dialog";
import {useState} from "react";


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
      if (!team.leaders.includes(authUser.uid))  {
        toast({title: "No Permission", description: `Only Leader can delete team.`}); return;
      }

      if (await TeamService.deleteTeam(team) === false) {
        console.log("err | TeamService.deleteTeam")
        toast({title: "Something went wrong. Please try later again."})
        return;
      }

      /* on success */
      setUserUpdater(prev => prev + 1)
      setTeamUpdater(prev => prev + 1)
      setCurrentTeamId(null)

      toast({title: `Team [${team.name}] deleted successfully.`})
      router.replace("/")

    }
    catch (err) {
      console.log(err);
      toast({title: "Something went wrong. Please try later again."})
    }
  }


  async function handleLeaveTeam() {

    if (team.leaders.includes(authUser.uid)) {
      toast({title: "You can't leave the team.", description: 'You are the only leader of this team. Please grant new leader and try again.'})
      return;
    }
    if (await TeamService.removeMember(authUser.uid, team.id, false) === false) {
      toast({title: "Something went wrong.", description: "Please contact us."})
    }

    /* on success */
    setUserUpdater(prev => prev + 1)
    setTeamUpdater(prev => prev + 1)
    setCurrentTeamId(null)
    toast({title: `You leave the team [${team.name}] successfully.`})
    router.replace("/")
  }

  return (
    <DropdownMenu>
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
      <DropdownMenuTrigger>
        <MenuIcon/>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup className="space-y-2">
          <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => setLeaveTeamDialogOpen(true)}>
            <DoorOpenIcon className="mr-3 w-5 h-5"/>
            <p>Leave Team</p>
          </Button>
          <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => setDeleteTeamDialogOpen(true)}>
            <Trash2Icon className="mr-3 w-5 h-5 text-red-600"/>
            <p className="text-red-600">Delete Team</p>
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
