"use client"

import {Suspense, useState} from "react";
import {isMobile} from "@/components/helper/helper-functions";
import {SongDetailDrawer} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-drawer";
import {SongDetailCard} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-card";

interface Props {
  teamId: string
  songId: string
  children: React.ReactNode
}
export function SongDetailCardWrapper({teamId, songId, children}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Suspense fallback={<></>}>
        {
          (isMobile())
          ? <SongDetailDrawer teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={false}/>
          : <SongDetailCard teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={false}/>
        }
      </Suspense>
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full">
        {children}
      </div>
    </>
  )
}
