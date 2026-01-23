"use client"

import { Button } from "@/components/ui/button";
import * as React from "react";
import { Invitation } from "@/models/invitation";
import { teamAtom } from "@/global-states/teamState";
import { useRecoilValue } from "recoil";
import { timestampToDateStringFormatted } from "@/components/util/helper/helper-functions";
import { userAtom } from "@/global-states/userState";
import { cn } from "@/lib/utils";
import { useInvitationActions } from "./use-invitation-actions";

interface Props {
  invitation: Invitation
  onResolve?: (id: string) => void
}

export function InvitationCard({ invitation, onResolve }: Props) {
  const sender = useRecoilValue(userAtom(invitation?.sender_id))
  const team = useRecoilValue(teamAtom(invitation?.team_id))

  const { handleAccept, handleDecline, isLoading } = useInvitationActions();

  // Helper to format date relative or short
  const formattedDate = timestampToDateStringFormatted(invitation?.invite_date);

  const onAcceptClick = async () => {
    const success = await handleAccept(invitation, team);
    if (success) {
      onResolve?.(invitation.id);
    }
  };

  const onDeclineClick = async () => {
    const success = await handleDecline(invitation, team);
    if (success) {
      onResolve?.(invitation.id);
    }
  };

  return (
    <div className="w-full">
      <div className="group relative flex w-full items-center gap-4 rounded-3xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">

        {/* Left: Squircle Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-bold text-white shadow-inner">
          {team?.name ? team.name[0].toUpperCase() : "?"}
        </div>

        {/* Middle: Text Info */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {team?.name || "Unknown Team"}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            Invited by <span className="font-medium text-foreground/80">{sender?.name || sender?.email || "Unknown"}</span>
            <span className="mx-1.5 opacity-50">•</span>
            <span className="opacity-80">{formattedDate}</span>
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 pl-2">
          <Button
            onClick={onDeclineClick}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Decline
          </Button>

          <Button
            onClick={onAcceptClick}
            disabled={isLoading}
            size="sm"
            className="h-9 rounded-full px-6 text-sm font-semibold shadow-sm hover:shadow-md"
          >
            Join
          </Button>
        </div>

      </div>
    </div>
  )
}
