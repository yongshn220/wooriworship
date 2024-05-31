"use client"

import Image from "next/image";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {Invitation} from "@/models/invitation";
import {teamAtom, teamUpdaterAtom} from "@/global-states/teamState";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {timestampToDateString, timestampToDateStringFormatted} from "@/components/helper/helper-functions";
import {toast} from "@/components/ui/use-toast";
import { InvitationService, TeamService, UserService } from "@/apis";
import { InvitationStatus } from "@/components/constants/enums";
import { auth } from "@/firebase";
import {userAtom, userUpdaterAtom} from "@/global-states/userState";
import {pendingReceivedInvitationsUpdaterAtom} from "@/global-states/invitation-state";


interface Props {
  invitation: Invitation
}

export function InvitationCard({invitation}: Props) {
  const user = auth.currentUser
  const sender = useRecoilValue(userAtom(invitation?.sender_id))
  const team = useRecoilValue(teamAtom(invitation?.team_id))
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const setInvitationsUpdater = useSetRecoilState(pendingReceivedInvitationsUpdaterAtom)
  const setTeamUpdater = useSetRecoilState(teamUpdaterAtom)

  async function handleAccept() {
    try {
      const promises = [
        InvitationService.updateInvitation(invitation.id, InvitationStatus.Accepted),
        UserService.addNewTeam(user.uid, team.id),
        TeamService.addNewMember(user.uid, team.id)
      ];
      const [invitationUpdateResult, addNewTeamResult, addNewMemberResult] = await Promise.all(promises);

      if (!addNewTeamResult || !addNewMemberResult) {
        console.log("err: InvitationCard-handleAccept")
        toast({title:"Failed to accept the team. Please try later again."})
      }
      else {
        toast({title: `You have successfully joined [${team.name}]`})
      }
      setUserUpdater(prev => prev + 1)
      setInvitationsUpdater(prev => prev + 1)
      setTeamUpdater(prev => prev + 1)
    }
    catch (err) {
      console.log("err: ", err);
      toast({title: "Oops, Something went wrong."})
    }
  }

  async function handleDecline() {
    try {
      const result = await InvitationService.updateInvitation(invitation.id, InvitationStatus.Reject);
      toast({title: `You declined invitation from [${team.name}]`})
      setInvitationsUpdater(prev => prev + 1)
    }
    catch (err) {
      console.log("error: "+err);
      toast({title: "Oops, Something went wrong."})
    }
  }

  return (
    <div className="w-full h-full flex-start">
      <div
        className="w-full flex h-60 rounded-lg bg-gradient-to-r from-[#A594F9] to-[#6247AA] text-white p-4 shadow-lg shadow-[#A594F9]/80">
        <div className="relative aspect-square h-full bg-white/20 rounded-sm p-2">
          <div className="relative h-full">
            <Image
              alt="compose music image"
              src="/illustration/happyMusic.svg"
              fill
            />
          </div>
        </div>
        <div className="w-full h-full flex flex-col pl-8">
          <div className="flex-1 flex flex-col gap-2">
            <p className="w-full flex-start text-2xl font-semibold">{team?.name}</p>
            <p className="w-full flex-start text-sm text-gray-200">From {sender?.email}</p>
          </div>
          <div className="w-full flex-end gap-2">
            <div className="w-full flex-start">
              <p className="text-xs text-gray-200 border p-1 rounded-sm">{timestampToDateStringFormatted(invitation?.invite_date)}</p>
            </div>
            <Button variant="ghost" onClick={handleDecline} className="hover:bg-white/20 hover:text-white">Decline</Button>
            <Button onClick={handleAccept} className="hover:bg-purple-900">Join Team</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
