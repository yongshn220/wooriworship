"use client"

import { Suspense, useState } from "react";
import { AddSetlistSongDialog } from "@/components/elements/design/song/song-list/setlist-form/add-setlist-song-dialog";
import { SetlistSongHeader } from "@/models/setlist";

interface Props {
  teamId: string
  children: React.ReactNode
  selectedSongs: SetlistSongHeader[]
  onUpdateList: (newSongs: SetlistSongHeader[]) => void
}
export function AddSetlistSongDialogTrigger({ teamId, children, selectedSongs, onUpdateList }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Suspense fallback={<></>}>
        <AddSetlistSongDialog
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
