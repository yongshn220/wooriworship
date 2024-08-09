'use client'

import {MenuButton} from "@/app/board/[teamId]/song/_components/menu-button";
import React from "react";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongCommentArea} from "@/app/board/[teamId]/song/_components/song-comment-area";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "@/components/ui/drawer";
import {SongDetailContent} from "@/app/board/[teamId]/song/_components/song-detail-content";
import {SelectSongMusicSheetKey} from "@/app/board/[teamId]/song/_components/select-song-music-sheet-key";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  selectedMusicSheetIds: Array<string>
  setMusicSheetIds: (musicSheetIds: string[]) => void
  readOnly: boolean
  isStatic: boolean // true if the song is beginning or ending song. Otherwise, false.
  onSelectHandler: () => void
}

export function SelectSongDetailDrawer({teamId, isOpen, setIsOpen, songId, selectedMusicSheetIds, setMusicSheetIds, readOnly=false, isStatic=false, onSelectHandler}: Props) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-5/6 p-0 border-0 ">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide rounded-lg bg-blue-500">
          <SelectSongMusicSheetKey
            songId={songId}
            isStatic={isStatic}
            onSelectHandler={onSelectHandler}
            selectedMusicSheetIds={selectedMusicSheetIds}
            setMusicSheetIds={setMusicSheetIds}
          />
          <div className="w-full p-6 bg-white rounded-lg">
            <DrawerHeader>
              {
                !readOnly &&
                <div
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <MenuButton teamId={teamId} songId={song?.id} songTitle={song?.title}/>
                </div>
              }
              <DrawerTitle className="text-center text-3xl font-bold">{song?.title}</DrawerTitle>
              {
                song?.subtitle &&
                <div className="text-center text-xl font-semibold">({song?.subtitle})</div>
              }
              <p className="text-center font-semibold text-gray-500">{song?.original.author}</p>
            </DrawerHeader>
            <SongDetailContent songId={songId}/>
            <div className="w-full flex-center">
              <SongCommentArea teamId={teamId} songId={songId}/>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
