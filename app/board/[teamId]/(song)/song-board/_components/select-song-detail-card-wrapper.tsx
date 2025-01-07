"use client"

import {useState} from "react";
import {SelectSongDetailDrawer} from "@/app/board/[teamId]/(song)/song-board/_components/select-song-detail-drawer";

interface Props {
  children: React.ReactNode
  teamId: string
  songId: string
  selectedMusicSheetIds: Array<string>
  setMusicSheetIds: (musicSheetIds: string[]) => void
  isStatic: boolean
  onSelectHandler?: () => void
}
export function SelectSongDetailCardWrapper({children, teamId, songId, selectedMusicSheetIds, setMusicSheetIds, isStatic, onSelectHandler}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <SelectSongDetailDrawer
        teamId={teamId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        songId={songId} readOnly={true}
        selectedMusicSheetIds={selectedMusicSheetIds}
        setMusicSheetIds={setMusicSheetIds}
        isStatic={isStatic}
        onSelectHandler={() => onSelectHandler()}
      />
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full">
        {children}
      </div>
    </>
  )
}
