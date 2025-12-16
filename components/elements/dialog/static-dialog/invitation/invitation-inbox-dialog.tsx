"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as React from "react";
import { auth } from "@/firebase";
import { Invitation } from "@/models/invitation";
import { Suspense, useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { InvitationService } from "@/apis";
import { InvitationCard } from "@/components/elements/dialog/static-dialog/invitation/invitation-card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean
  setIsOpen: Function
}
export function InvitationInboxDialog({ isOpen, setIsOpen }: Props) {
  const authUser = auth.currentUser
  const [invitations, setInvitations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchInvitations = React.useCallback(async () => {
    if (!authUser?.email) return;

    setIsLoading(true)
    try {
      const data = await InvitationService.getPendingReceivedInvitations(authUser.email)
      setInvitations(data)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }, [authUser?.email])

  useEffect(() => {
    if (isOpen) {
      fetchInvitations()
    }
  }, [isOpen, fetchInvitations])

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DialogContent className="sm:max-w-[700px] flex flex-col h-2/3 overflow-y-scroll scrollbar-hide">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-2xl">Team Invitations</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchInvitations}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
          <DialogDescription>You are invited from the following teams. Join now!</DialogDescription>
          <Separator />
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
              <InvitationCard
                invitation={invitation}
                onResolve={(id) => setInvitations(prev => prev.filter((i: Invitation) => i.id !== id))}
              />
            </Suspense>
          ))
        }
      </DialogContent>
    </Dialog>
  )
}
