"use client"

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {TeamIcon} from "@/components/team-icon";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import Image from 'next/image'
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {userUpdaterAtom} from "@/global-states/userState";
import {useRouter} from "next/navigation";
import {SettingsIcon} from "lucide-react";
import { InvitationService, TeamService } from "@/apis";
import {auth} from "@/firebase";
import {PendingMember} from "@/app/board/_components/nav-bar/pending-member";
import {Separator} from "@/components/ui/separator";
import {InvitedMember} from "@/app/board/_components/nav-bar/invited-member";
import {toast} from "@/components/ui/use-toast";
import {sentInvitationsAtom, sentInvitationsUpdaterAtom} from "@/global-states/invitation-state";
import { emailExists } from "@/components/helper/helper-functions";

export function ManageTeamButton() {
  const authUser = auth.currentUser
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(currentTeamId))
  const sentInvitations = useRecoilValue(sentInvitationsAtom({userId: authUser?.uid, teamId:team?.id}))
  const setSentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom)
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false)
  const [receiverEmail, setReceiverEmail] = useState("")
  const router = useRouter()


  async function handleAddPeople() {
    if (emailExists(sentInvitations.map((x) => x.receiver_email), receiverEmail)) {
      toast({title: "Invitation Already sent", description:"Invitation already sent to the given email"});
      return;
    } else if (receiverEmail == authUser?.email) {
      toast({title: "Nice Try.", description:"You can't send an invitation to yourself."});
      return;
    }
    //team.users 에 이메일 받아야함.
    
    InvitationService.createInvitation(authUser?.uid, authUser?.email, currentTeamId, team?.name, receiverEmail).then(invitationId => {
      if (!invitationId) {
        toast({title: "Can't send invitation", description: "The following user set up a restriction on team invitation or email."})
      }
      else {
        toast({title: "Successfully sent the invitation.", description: `Invitation email has sent to ${receiverEmail}`})
        setSentInvitationsUpdater(prev => prev + 1)
      }
    });
  }

  async function handleDeleteTeam() {
    // Todo: firebase
    await TeamService.deleteTeam(team);
  }

  function openConfirmation() {
    setIsOpenDeleteDialog(true)
  }

  async function handleLeaveTeam() {
    if (team.leaders.includes(authUser.uid)) {
      toast({title: "Please don't leave", description: 'You are the leader of this team'})
      return;
    }
    await TeamService.removeMember(authUser.uid, team.id);
  }

  function onDeleteTeamCompleteCallback() {
    setIsOpenDeleteDialog(false)
    // setUserUpdater(prev => prev + 1)
    // router.replace(getPathBoard())
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!currentTeamId} variant="outline" className="w-full">
          <SettingsIcon className="h-4 w-4 mr-2"/>
          <p>Manage Team</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Team</DialogTitle>
        </DialogHeader>
        <div className="flex-center gap-2">
          <TeamIcon name={team?.name}/>
          <p className="font-bold text-sm">{team?.name}</p>
        </div>
        <div className="w-full flex-start flex-col items-center gap-1.5">
          <Label htmlFor="name" className="text-xl sm:text-base">
            Invited Members ({team?.users.length})
          </Label>
          <div className="w-full divide-y divide-gray-300">
            {
              team?.users?.map((userId) => (
                <InvitedMember key={userId} userId={userId}/>
              ))
            }
          </div>
          <Label htmlFor="name" className="text-xl sm:text-base mt-4">
            Pending Members ({sentInvitations?.length})
          </Label>
          {
            sentInvitations?.length === 0 &&
            <div className="w-full flex-center text-sm text-gray-500">No invitations</div>
          }
          <div className="w-full divide-y divide-gray-300">
            {
              sentInvitations?.map((invitation) => (
                <PendingMember key={invitation?.id} invitation={invitation}/>
              ))
            }
          </div>
          <div className="w-full flex gap-4 mt-4">
            <Image alt="mail icon" src="/icons/mailIcon.svg" width={25} height={25}/>
            <Input placeholder="Email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)}/>
            <Button onClick={handleAddPeople}>Add People</Button>
          </div>
        </div>
        <DialogFooter className="w-full mt-10">
          <div className="w-full flex flex-col">
            <DeleteConfirmationDialog
              isOpen={isOpenDeleteDialog}
              setOpen={setIsOpenDeleteDialog}
              title="Delete Team"
              description={`Do you really want to delete [${team?.name}]? This action cannot be undone.`}
              onDeleteHandler={handleDeleteTeam}
              callback={onDeleteTeamCompleteCallback}
            />
            <Separator className="my-4"/>
            <div className="w-full flex-end">
              <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-500" onClick={openConfirmation}>Delete Team</Button>
              <Button variant="outline" className="" onClick={handleLeaveTeam}>Leave Team</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
