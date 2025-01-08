"use client"

import {SelectItem} from "@/components/ui/select";
import {useRecoilValue} from "recoil";
import {teamAtom} from "@/global-states/teamState";

interface Props {
  teamId: string
}

export function TeamItem({teamId}: Props) {
  const team = useRecoilValue(teamAtom(teamId))

  return (
    <SelectItem value={teamId.toString()}>
      {team?.name}
    </SelectItem>
  )
}
