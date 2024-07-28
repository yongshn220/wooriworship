'use client'

import {Dialog, DialogContentNoCloseButton, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import Image from "next/image"
import {OpenYoutubeLink, getTimePassedFromTimestamp} from "@/components/helper/helper-functions";
import {MenuButton} from "@/app/board/[teamId]/song/_components/menu-button";
import {SongMusicSheetViewer} from "@/app/board/[teamId]/song/_components/song-music-sheet-viewer";
import {useState} from "react";
import {LinkIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongCommentArea} from "@/app/board/[teamId]/song/_components/song-comment-area";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";
import {SongDetailContent} from "@/app/board/[teamId]/song/_components/song-detail-content";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailDrawer({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-5/6">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide p-4">
          <DrawerHeader>
            {
              !readOnly &&
              <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <MenuButton teamId={teamId} songId={song?.id} songTitle={song?.title}/>
              </div>
            }
            <DrawerTitle className="text-center text-3xl font-bold">{song?.title}</DrawerTitle>
            <p className="text-center font-semibold text-gray-500">{song.original.author}</p>
          </DrawerHeader>
          <SongDetailContent songId={songId}/>
          <div className="w-full flex-center">
            <SongCommentArea teamId={teamId} songId={songId}/>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
