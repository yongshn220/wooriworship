"use client"

import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {Song} from "@/models/song";
import {useState} from "react";


interface Props {
  song: Song
  children: React.ReactNode
}
export function SongDetailCardWrapper({song, children}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div onClick={() => setIsOpen(prev => !prev)}>
      <SongDetailCard isOpen={isOpen} setIsOpen={setIsOpen} song={song} editable={false}/>
      {children}
    </div>
  )
}
