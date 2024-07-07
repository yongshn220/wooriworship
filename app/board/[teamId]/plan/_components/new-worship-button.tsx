'use client'

import {useState} from "react";
import {Song} from "@/models/song";
import {useRecoilValue} from "recoil";
import {Button} from "@/components/ui/button";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {getPathCreatePlan} from "@/components/helper/routes";

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
    <Button disabled={!teamId} className="bg-blue-500 hover:bg-blue-400" onClick={handleClick}>
      + Add Worship
    </Button>
  )
}
