"use client"

import { Suspense, useState } from "react";
import { AddWorshipSongDialog } from "@/components/elements/design/song/song-list/worship-form/add-worship-song-dialog";
import { WorshipSongHeader } from "@/models/worship";

interface Props {
  teamId: string
  children: React.ReactNode
  selectedSongs: WorshipSongHeader[]
  onUpdateList: (newSongs: WorshipSongHeader[]) => void
}
export function AddWorshipSongDialogTrigger({ teamId, children, selectedSongs, onUpdateList }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Suspense fallback={<></>}>
        <AddWorshipSongDialog
          teamId={teamId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedSongs={selectedSongs}
          onUpdateList={onUpdateList}
        />
      </Suspense>
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full cursor-pointer">
        {children}
      </div>
    </>
  )
}
