'use client'

import {Suspense, useState} from "react";
import {Song} from "@/models/song";
import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {FormMode} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {Button} from "@/components/ui/button";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {getPathCreatePlan, getPathPlan} from "@/components/helper/routes";

export interface WorshipInfo {
  title: string
  description: string
  date: Date
  songInfoList: Array<SongInfo>
}

export interface SongInfo {
  note: string
  song: Song
}

export function NewWorshipButton() {
  const [isOpen, setIsOpen] = useState(false)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  function handleClick() {
    // setIsOpen(true)
    router.push(getPathCreatePlan(teamId))
  }

  return (
    <>
      <Suspense fallback={<div>loading worship form...</div>}>
        <WorshipForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} worship={null}/>
      </Suspense>
      <Button disabled={!teamId} className="bg-purple-500 hover:bg-purple-400" onClick={handleClick}>
        + Add Worship
      </Button>
    </>
  )
}
