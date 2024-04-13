'use client'

import {Hint} from "@/components/hint";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {cn} from "@/lib/utils";
import {getPathPlan} from "@/components/helper-function/routes";
import {useRouter} from "next/navigation";


interface Props {
  teamId: string;
}

export function TeamIconHint({teamId}: Props) {
  const router = useRouter()
  const team = useRecoilValue(teamAtomById(teamId))
  const [currentTeamId, setCurrentTeamId] = useRecoilState(currentTeamIdAtom)

  function handleChangeTeam() {
    setCurrentTeamId(teamId)
    router.push(getPathPlan(teamId))
  }

  return (
    <div
      className="aspect-square relative "
      onClick={handleChangeTeam}
    >
      <Hint label={team?.name || ""} side="right" align="start" sideOffset={18}>
        <div className={cn("flex-center w-[40px] h-[40px] rounded-md cursor-pointer opacity-50 hover:opacity-100 transition bg-purple-700 text-white text-xl", {"opacity-100": currentTeamId === teamId})}>
          {team?.name[0]?.toUpperCase()}
        </div>
      </Hint>
    </div>
  )
}
