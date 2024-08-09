"use client"

import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import * as React from "react";
import {InvitationCard} from "@/app/board/_components/nav-bar/invitation-card";
import {auth} from "@/firebase";
import {Invitation} from "@/models/invitation";
import {Suspense, useEffect, useState} from "react";
import {Separator} from "@/components/ui/separator";
import {InvitationService} from "@/apis";

interface Props {
  isOpen: boolean
  setIsOpen: Function
}
export function InvitationDialog({isOpen, setIsOpen}: Props) {
  const authUser = auth.currentUser
  const [invitations, setInvitations] = useState([])

  useEffect(() => {
    if (isOpen) {
      try {
        InvitationService.getPendingReceivedInvitations(authUser.email).then(invitations => {
          setInvitations(invitations)
        })
      }
      catch (e) {
        console.log(e)
      }
    }
  }, [isOpen, authUser.email])

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogContent className="sm:max-w-[700px] flex flex-col h-2/3 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-2xl">Team Invitations</DialogTitle>
          <DialogDescription>You are invited from the following teams. Join now!</DialogDescription>
          <Separator/>
        </DialogHeader>
        {
          invitations.length === 0 &&
          <div className="h-full flex-center flex-col">
            <p className="text-gray-500">No pending invitations</p>
          </div>
        }
        {
          invitations?.map((invitation: Invitation) => (
            <Suspense key={invitation.id} fallback={<></>}>
              <InvitationCard invitation={invitation}/>
            </Suspense>
          ))
        }
      </DialogContent>
    </Dialog>
  )
}
