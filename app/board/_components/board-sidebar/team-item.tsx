"use client"

import {SelectItem} from "@/components/ui/select";
import {useRecoilValue} from "recoil";
import {teamAtomById} from "@/global-states/teamState";

interface Props {
  teamId: string
}

export function TeamItem({teamId}: Props) {
  const team = useRecoilValue(teamAtomById(teamId))

  return (
    <SelectItem value={teamId}>
      {team?.name}
    </SelectItem>
  )
}
