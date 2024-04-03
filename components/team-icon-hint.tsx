'use client'

import {Hint} from "@/components/hint";
import {useSetRecoilState} from "recoil";
import {currentTeamAtom} from "@/global-states/teamState";
import {Team} from "@/models/team";


interface Props {
  team: Team;
}

export function TeamIconHint({team}: Props) {
  const setCurrentTeam = useSetRecoilState(currentTeamAtom)

  function handleSelectTeam() {
    setCurrentTeam(team)
  }

  return (
    <div
      className="aspect-square relative "
      onClick={handleSelectTeam}
    >
      <Hint label={team.name} side="right" align="start" sideOffset={18}>
        <div className="flex-center w-[40px] h-[40px] rounded-md cursor-pointer opacity-75 hover:opacity-100 transition bg-purple-700 text-white text-xl">
          {team.name[0]?.toUpperCase()}
        </div>
      </Hint>
    </div>
  )
}
