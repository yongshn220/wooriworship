"use client"

import {useState} from "react";
import {AddableSongDetailDialog} from "@/components/elements/design/song/song-detail-card/setlist-form/addable-song-detail-dialog";

interface Props {
  children: React.ReactNode
  teamId: string
  songId: string
  selectedMusicSheetIds: Array<string>
  setMusicSheetIds: (musicSheetIds: string[]) => void
  isStatic: boolean
  onSelectHandler?: () => void
}
export function AddableSongDetailDialogTrigger({children, teamId, songId, selectedMusicSheetIds, setMusicSheetIds, isStatic, onSelectHandler}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AddableSongDetailDialog
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
