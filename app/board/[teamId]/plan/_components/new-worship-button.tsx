'use client'

import {Plus} from "lucide-react";
import {useState} from "react";
import {Song} from "@/models/song";
import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {Mode} from "@/components/constants/enums";
import {useSetRecoilState} from "recoil";
import {selectedSongInfoListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {Button} from "@/components/ui/button";

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
  const setSelectedSongInfoList = useSetRecoilState(selectedSongInfoListAtom)

  function handleClick() {
    setSelectedSongInfoList([])
    setIsOpen(true)
  }

  return (
    <>
      <WorshipForm mode={Mode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} worship={null}/>
      <Button className="bg-purple-500 hover:bg-purple-400" onClick={handleClick}>
        + Add Worship
      </Button>
    </>
  )
}
