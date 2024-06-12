"use client"

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {TeamIcon} from "@/components/team-icon";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import Image from 'next/image'
import {Input} from "@/components/ui/input";
import {useMemo, useState} from "react";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {currentTeamIdAtom, teamAtom, teamUpdaterAtom} from "@/global-states/teamState";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {SettingsIcon} from "lucide-react";
import { InvitationService, TeamService } from "@/apis";
import {auth} from "@/firebase";
import {PendingMember} from "@/app/board/_components/nav-bar/pending-member";
import {Separator} from "@/components/ui/separator";
import {InvitedMember} from "@/app/board/_components/nav-bar/invited-member";
import {toast} from "@/components/ui/use-toast";
import {sentInvitationsAtom, sentInvitationsUpdaterAtom} from "@/global-states/invitation-state";
import { emailExists } from "@/components/helper/helper-functions";
import {useRouter} from "next/navigation";
import {userUpdaterAtom} from "@/global-states/userState";
import {InvitationStatus} from "@/components/constants/enums";
import useViewportHeight from "@/components/hook/use-viewport-height";
import {ConfirmationDialog} from "@/components/dialog/confirmation-dialog";
import { StatusCodes } from 'http-status-codes';
import {TeamSelect} from "@/app/board/_components/board-sidebar/team-select";


export function ManageTeamDialog({children}: any) {
  const authUser = auth.currentUser
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(currentTeamId))
  const sentInvitations = useRecoilValue(sentInvitationsAtom({userId: authUser?.uid, teamId:team?.id}))
  const setSentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom)
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const setTeamUpdater = useSetRecoilState(teamUpdaterAtom)
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)

  const [receiverEmail, setReceiverEmail] = useState("")
  const [isAddPeopleLoading, setAddPeopleLoading] = useState(false)

  const [isDeleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false)
  const [isLeaveTeamDialogOpen, setLeaveTeamDialogOpen] = useState(false)


  const viewportHeight = useViewportHeight();
  const router = useRouter()
  const pendingInvitations = useMemo(() => sentInvitations.filter((invitation) => invitation.invitation_status !== InvitationStatus.Accepted), [sentInvitations])

  function handleAddPeople() {
    setAddPeopleLoading(true)

    if (isAddPeopleLoading) {
      toast({description: "Invitation is sending now."});
      return setAddPeopleLoading(false)
    }

    try {
      if (receiverEmail.toLowerCase() == authUser?.email.toLowerCase()) {
        toast({title: "Nice Try.", description:"You can't send an invitation to yourself."});
        return;
      }

        InvitationService.createInvitation(authUser?.uid, authUser?.email, currentTeamId, team?.name, receiverEmail.toLowerCase()).then(invitationId => {
          if (!invitationId) {
            toast({title: "Can't send invitation", description: "The following user set up a restriction on team invitation or email."})
            return;
          }

          if (receiverEmail.toLowerCase() == authUser?.email.toLowerCase()) {
            toast({title: "Nice Try.", description: "You can't send an invitation to yourself."});
            return;
          }

          //TODO
          // if (receiverEmail.toLowerCase() in currenetMemberEmails) {
          //   fail
          // }

          toast({title: "Successfully sent the invitation.", description: `Invitation email has sent to ${receiverEmail}`})
          setSentInvitationsUpdater(prev => prev + 1)
          setAddPeopleLoading(false)

        }).catch((e) => {
          if (e.status === StatusCodes.UNPROCESSABLE_ENTITY) {
            toast({title:"Send fail", description: "Email structure is invalid. Please check the email.", variant: "destructive"})
          }
          else {
            toast({title: "Something went wrong. Please contact us.", variant: "destructive"})
          }
          setAddPeopleLoading(false)
        });
    }
    catch (e) {
      console.log(e, "manage-team-button/handleAddPeople")
      toast({title: "Something went wrong. Please contact us."})
    }
  }

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
    <Dialog>
      <DialogTrigger asChild>
        <div>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] overflow-y-scroll scrollbar-hide top-0 translate-y-0 mt-[50px]" style={{ maxHeight: `${viewportHeight - 100}px` }}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Team</DialogTitle>
        </DialogHeader>
        <div>
          <TeamSelect createOption={false}/>
        </div>

        <div className="w-full flex-start flex-col items-center gap-1.5">
          <Label htmlFor="name" className="text-xl sm:text-base">
            Invited Members ({team?.users.length})
          </Label>
          <div className="w-full divide-y divide-gray-300">
            {
              team?.users?.map((userId) => (
                <InvitedMember key={userId} userId={userId} teamId={currentTeamId}/>
              ))
            }
          </div>
          <Label htmlFor="name" className="text-xl sm:text-base mt-4">
            Pending Members ({pendingInvitations?.length})
          </Label>
          {
            pendingInvitations?.length === 0 &&
            <div className="w-full flex-center text-sm text-gray-500">No invitations</div>
          }
          <div className="w-full divide-y divide-gray-300">
            {
              pendingInvitations?.map((invitation) => (
                <PendingMember key={invitation?.id} invitation={invitation}/>
              ))
            }
          </div>
          <div className="w-full flex gap-4 mt-4">
            <Image alt="mail icon" src="/icons/mailIcon.svg" width={25} height={25}/>
            <Input placeholder="Email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)}/>
            <Button disabled={isAddPeopleLoading} onClick={handleAddPeople}>{isAddPeopleLoading? "Adding People..." : "Add People"}</Button>
          </div>
        </div>
        <DialogFooter className="w-full mt-10">
          <div className="w-full flex flex-col">
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
            <Separator className="my-4"/>
            <div className="w-full flex-end gap-2">
              {
                team?.leaders.includes(authUser?.uid) &&
                <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-500" onClick={() => setDeleteTeamDialogOpen(true)}>Delete Team</Button>
              }
              <Button variant="outline" className="" onClick={() => setLeaveTeamDialogOpen(true)}>Leave Team</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
