"use client"

import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import * as React from "react";
import {InvitationCard} from "@/app/board/_components/nav-bar/invitation-card";
import {auth} from "@/firebase";
import {Invitation} from "@/models/invitation";
import {useRecoilValue} from "recoil";
import {pendingReceivedInvitationsAtom} from "@/global-states/invitation-state";

interface Props {
  isOpen: boolean
  setIsOpen: Function
}
export function InvitationDialog({isOpen, setIsOpen}: Props) {
  const authUser = auth.currentUser
  const invitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email))

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogContent className="sm:max-w-[700px] flex flex-col h-2/3 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invitations</DialogTitle>
        </DialogHeader>
        {
          invitations?.map((invitation: Invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation}/>
          ))
        }
      </DialogContent>
    </Dialog>
  )
}
