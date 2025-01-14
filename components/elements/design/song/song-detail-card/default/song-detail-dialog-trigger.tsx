"use client"

import {Suspense, useState} from "react";
import {SongDetailDialog} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";

interface Props {
  teamId: string
  songId: string
  children: React.ReactNode
}
export function SongDetailDialogTrigger({teamId, songId, children}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Suspense fallback={<></>}>
        <SongDetailDialog teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={false}/>
      </Suspense>
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full">
        {children}
      </div>
    </>
  )
}
