'use client'

import {useState} from "react";
import {Song} from "@/models/song";
import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {FormMode} from "@/components/constants/enums";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {Button} from "@/components/ui/button";
import {currentTeamIdAtom} from "@/global-states/teamState";

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

  function handleClick() {
    setIsOpen(true)
  }

  return (
    <>
      <WorshipForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} worship={null}/>
      <Button disabled={!teamId} className="bg-purple-500 hover:bg-purple-400" onClick={handleClick}>
        + Add Worship
      </Button>
    </>
  )
}
