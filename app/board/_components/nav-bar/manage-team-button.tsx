"use client"

import {Button} from "@/components/ui/button";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRecoilValue} from "recoil";
import {SettingsIcon} from "lucide-react";


export function ManageTeamButton() {
  const currentTeamId = useRecoilValue(currentTeamIdAtom)

  return (
    <Button disabled={!currentTeamId} variant="ghost" className="w-full flex-start gap-2">
      <SettingsIcon className="w-[20px] h-[20px]"/>
      <p>Manage Team</p>
    </Button>
  )
}
