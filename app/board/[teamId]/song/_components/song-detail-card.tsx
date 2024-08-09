'use client'

import {Dialog, DialogContentNoCloseButton, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {MenuButton} from "@/app/board/[teamId]/song/_components/menu-button";
import React from "react";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongCommentArea} from "@/app/board/[teamId]/song/_components/song-comment-area";
import {SongDetailContent} from "@/app/board/[teamId]/song/_components/song-detail-content";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailCard({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContentNoCloseButton className="sm:max-w-[600px] h-5/6">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide">
          <DialogHeader>
            {
              !readOnly &&
              <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <MenuButton teamId={teamId} songId={song?.id} songTitle={song?.title}/>
              </div>
            }
            <DialogTitle className="text-center text-3xl font-bold">{song?.title}</DialogTitle>
            {
              song?.subtitle &&
              <div className="text-center text-xl font-semibold">({song?.subtitle})</div>
            }
            <p className="text-center font-semibold text-gray-500">{song?.original.author}</p>
          </DialogHeader>
          <SongDetailContent songId={songId}/>
          <div className="w-full flex-center">
            <SongCommentArea teamId={teamId} songId={songId}/>
          </div>
        </div>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}

