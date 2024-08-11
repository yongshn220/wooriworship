"use client"

import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {Suspense, useState} from "react";
import {SongDetailDrawer} from "@/app/board/[teamId]/song/_components/song-detail-drawer";
import {isMobile} from "@/components/helper/helper-functions";

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
          ? <SongDetailDrawer teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={true}/>
          : <SongDetailCard teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={true}/>
        }
      </Suspense>
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full">
        {children}
      </div>
    </>
  )
}
