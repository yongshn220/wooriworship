"use client"

import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {Song} from "@/models/song";
import {useState} from "react";

interface Props {
  teamId: string
  song: Song
  children: React.ReactNode
}
export function SongDetailCardWrapper({teamId, song, children}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <SongDetailCard teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} song={song} readOnly={true}/>
      <div onClick={() => setIsOpen(prev => !prev)}>
        {children}
      </div>
    </>
  )
}
