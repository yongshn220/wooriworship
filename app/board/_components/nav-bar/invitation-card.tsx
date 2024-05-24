"use client"

import Image from "next/image";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {Invitation} from "@/models/invitation";
import {teamAtom} from "@/global-states/teamState";
import {useRecoilValue} from "recoil";
import {timestampToDateString} from "@/components/helper/helper-functions";
import {toast} from "@/components/ui/use-toast";


interface Props {
  invitation: Invitation
}

export function InvitationCard({invitation}: Props) {
  const team = useRecoilValue(teamAtom(invitation?.team_id))

  async function handleAccept() {
  }

  async function handleDecline() {
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
            <p className="w-full flex-start text-sm text-gray-200">{timestampToDateString(invitation?.invite_date)}</p>
          </div>
          <div className="w-full flex-end gap-2">
            <Button variant="ghost" onClick={handleDecline} className="hover:bg-white/20 hover:text-white">Decline</Button>
            <Button onClick={handleAccept} className="hover:bg-purple-900">Accept</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
