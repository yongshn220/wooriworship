"use client"

import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {Song} from "@/models/song";
import {useState} from "react";
import {SongDetailDrawer} from "@/app/board/[teamId]/song/_components/song-detail-drawer";
import {isMobile} from "@/components/helper/helper-functions";
import {SelectSongDetailDrawer} from "@/app/board/[teamId]/song/_components/select-song-detail-drawer";
import {SelectSongDetailCard} from "@/app/board/[teamId]/song/_components/select-song-detail-card";

interface Props {
  children: React.ReactNode
  teamId: string
  songId: string
  selectedKeys: Array<string>
  setSelectedKeys: (selectedKeys: string[]) => void
  isStatic?: boolean
}
export function SelectSongDetailCardWrapper({children, teamId, songId, selectedKeys, setSelectedKeys, isStatic}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {
        (isMobile())
        ? <SelectSongDetailDrawer teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={true} selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} isStatic={isStatic}/>
        : <SelectSongDetailCard teamId={teamId} isOpen={isOpen} setIsOpen={setIsOpen} songId={songId} readOnly={true} selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} isStatic={isStatic}/>
      }
      <div onClick={() => setIsOpen(prev => !prev)} className="w-full">
        {children}
      </div>
    </>
  )
}
