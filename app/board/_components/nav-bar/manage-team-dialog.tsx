"use client"

import {Dialog, DialogContentNoCloseButton, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import Image from 'next/image'
import {Input} from "@/components/ui/input";
import {useMemo, useState} from "react";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {useRecoilValue, useSetRecoilState} from "recoil";
import { InvitationService } from "@/apis";
import {auth} from "@/firebase";
import {PendingMember} from "@/app/board/_components/nav-bar/pending-member";
import {InvitedMember} from "@/app/board/_components/nav-bar/invited-member";
import {toast} from "@/components/ui/use-toast";
import {sentInvitationsAtom, sentInvitationsUpdaterAtom} from "@/global-states/invitation-state";
import {usersAtom} from "@/global-states/userState";
import {InvitationStatus} from "@/components/constants/enums";
import useViewportHeight from "@/components/hook/use-viewport-height";
import { StatusCodes } from 'http-status-codes';
import {TeamSelect} from "@/app/board/_components/board-sidebar/team-select";
import {ManageTeamMenu} from "@/app/board/_components/nav-bar/manage-team-menu";


export function ManageTeamDialog({children}: any) {
  const authUser = auth.currentUser
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(currentTeamId))
  const members = useRecoilValue(usersAtom(team?.users))
  const sentInvitations = useRecoilValue(sentInvitationsAtom({userId: authUser?.uid, teamId:team?.id}))
  const setSentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom)

  const [receiverEmail, setReceiverEmail] = useState("")
  const [isAddPeopleLoading, setAddPeopleLoading] = useState(false)

  const pendingInvitations = useMemo(() => sentInvitations.filter((invitation) => invitation.invitation_status !== InvitationStatus.Accepted), [sentInvitations])

  function handleAddPeople() {
    setAddPeopleLoading(true)

    if (isAddPeopleLoading) {
      toast({description: "Invitation is on processing."});
      return;
    }

    try {
      if (receiverEmail.toLowerCase() == authUser?.email.toLowerCase()) {
        toast({title: "Can't send invitation", description:"You can't send an invitation to yourself."});
        setAddPeopleLoading(false)
        return;
      }

      if (members.map(m => m.email.toLowerCase()).includes(receiverEmail.toLowerCase())) {
        toast({title: "Can't send invitation", description: "The following user is already the team member."})
        setAddPeopleLoading(false)
        return;
      }

      InvitationService.createInvitation(authUser?.uid, authUser?.email, currentTeamId, team?.name, receiverEmail.toLowerCase()).then(invitationId => {
        if (!invitationId) {
          toast({title: "Can't send invitation", description: "The following user set up a restriction on team invitation or email."})
          setAddPeopleLoading(false)
          return;
        }

        setReceiverEmail("")
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          {children}
        </div>
      </DialogTrigger>
      <DialogContentNoCloseButton className="flex-start flex-col sm:max-w-[600px] h-[90%] overflow-y-scroll scrollbar-hide top-1/2 -translate-y-1/2 " >
        <DialogHeader className="w-full border-b">
          <div
            className="absolute right-6 top-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <ManageTeamMenu/>
          </div>
          <DialogTitle className="text-2xl">Manage Team</DialogTitle>
          <div className="w-full flex-center py-4">
            <TeamSelect createOption={false}/>
          </div>
        </DialogHeader>
        <div className="w-full flex-start flex-col">

          <div className="w-full flex-start flex-col items-center gap-1.5 mb-10">

            <div className="w-full flex gap-4 mb-4 ">
              <Image alt="mail icon" src="/icons/mailIcon.svg" width={25} height={25}/>
              <Input placeholder="Email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)}/>
              <Button variant="outline" disabled={isAddPeopleLoading} onClick={handleAddPeople}>{isAddPeopleLoading ? "Sending..." : "Add Member"}</Button>
            </div>
          </div>

          <div className="w-full flex-start flex-col items-center gap-1.5">
            <Label htmlFor="name" className="text-xl sm:text-base">
              Invited Members ({team?.users.length})
            </Label>
            <div className="w-full">
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
              <div className="w-full flex-center text-sm text-gray-500 h-20">No pending members</div>
            }
            <div className="w-full divide-y divide-gray-300">
              {
                pendingInvitations?.map((invitation) => (
                  <PendingMember key={invitation?.id} invitation={invitation}/>
                ))
              }
            </div>
          </div>
        </div>
        <DialogFooter className="w-full mt-10"></DialogFooter>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}
