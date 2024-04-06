'use client'

import {Hint} from "@/components/hint";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {Team} from "@/models/team";


interface Props {
  teamId: string;
}

export function TeamIconHint({teamId}: Props) {
  const team = useRecoilValue(teamAtomById(teamId))
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)

  function handleSelectTeam() {
    setCurrentTeamId(teamId)
  }

  return (
    <div
      className="aspect-square relative "
      onClick={handleSelectTeam}
    >
      {/*<Hint label={team?.name || ""} side="right" align="start" sideOffset={18}>*/}
      {/*  <div className="flex-center w-[40px] h-[40px] rounded-md cursor-pointer opacity-75 hover:opacity-100 transition bg-purple-700 text-white text-xl">*/}
      {/*    {team?.name[0]?.toUpperCase()}*/}
      {/*  </div>*/}
      {/*</Hint>*/}
    </div>
  )
}
