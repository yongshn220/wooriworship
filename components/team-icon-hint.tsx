'use client'

import {Hint} from "@/components/hint";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {cn} from "@/lib/utils";


interface Props {
  teamId: string;
}

export function TeamIconHint({teamId}: Props) {
  const team = useRecoilValue(teamAtomById(teamId))
  const [currentTeamId, setCurrentTeamId] = useRecoilState(currentTeamIdAtom)

  function handleSelectTeam() {
    setCurrentTeamId(teamId)
  }

  return (
    <div
      className="aspect-square relative "
      onClick={handleSelectTeam}
    >
      <Hint label={team?.name || ""} side="right" align="start" sideOffset={18}>
        <div className={cn("flex-center w-[40px] h-[40px] rounded-md cursor-pointer opacity-50 hover:opacity-100 transition bg-purple-700 text-white text-xl", {"opacity-100": currentTeamId === teamId})}>
          {team?.name[0]?.toUpperCase()}
        </div>
      </Hint>
    </div>
  )
}
