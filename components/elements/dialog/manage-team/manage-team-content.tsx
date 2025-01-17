"use client"

import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useMemo, useState} from "react";
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState";
import {useRecoilValue, useSetRecoilState} from "recoil";
import { InvitationService } from "@/apis";
import {auth} from "@/firebase";
import {toast} from "@/components/ui/use-toast";
import {sentInvitationsAtom, sentInvitationsUpdaterAtom} from "@/global-states/invitation-state";
import {usersAtom} from "@/global-states/userState";
import {InvitationStatus} from "@/components/constants/enums";
import { StatusCodes } from 'http-status-codes';
import {TeamSelect} from "@/components/elements/design/team/team-select";
import {UserPlusIcon} from "lucide-react";
import {PendingMember} from "@/components/elements/dialog/manage-team/pending-member";
import {InvitedMember} from "@/components/elements/dialog/manage-team/invited-member";
import {ManageTeamMenu} from "@/components/elements/dialog/manage-team/manage-team-menu";

export function ManageTeamContent() {
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
    <div className="w-full h-full flex-start flex-col p-4">
      <div className="w-full border-b">
        <div className="flex-between">
          <p className="text-xl font-semibold">Manage Team</p>
          <div
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <ManageTeamMenu/>
          </div>
        </div>
        <div className="w-full flex-center py-4">
          <TeamSelect createOption={true}/>
        </div>
      </div>
      <div className="w-full flex-start flex-col">

        <div className="w-full flex-center flex-col items-center gap-1.5 my-10">
          <p className="text-muted-foreground text-sm mb-2">Invite people to join your team.</p>
          <div className="w-full flex gap-4 mb-4 ">
            <Input placeholder="Enter Email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)}/>
            <Button variant="outline" disabled={isAddPeopleLoading} className="gap-2" onClick={handleAddPeople}>
              <UserPlusIcon/>
              {isAddPeopleLoading ? "Inviting..." : "Invite"}
            </Button>
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
          <div className="w-full divide-y divide-gray-300 mb-10">
            {
              pendingInvitations?.map((invitation) => (
                <PendingMember key={invitation?.id} invitation={invitation}/>
              ))
            }
          </div>
        </div>
      </div>
      <div className="w-full mt-10"></div>
    </div>
  )
}
