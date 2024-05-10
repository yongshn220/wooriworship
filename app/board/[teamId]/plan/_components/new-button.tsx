'use client'

import {Plus} from "lucide-react";
import {useState} from "react";
import {Song} from "@/models/song";
import {WorshipForm} from "@/app/board/[teamId]/plan/_components/worship-form";
import {Mode} from "@/components/constants/enums";

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

export function NewButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <WorshipForm mode={Mode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} worship={null}/>
      <div
        className="group aspect-[1/1] border rounded-lg flex-center flex-col overflow-hidden bg-blue-500 hover:bg-blue-600 cursor-pointer">
        <Plus className="h-12 w-12 text-white stroke-1"/>
        <p className="text-sm text-white">New board</p>
      </div>
    </>
  )
}
