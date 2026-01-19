'use client'

import React from "react";
import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MusicKeySelector } from "@/components/elements/design/song/song-detail-card/worship-form/parts/music-key-selector";
import { SongDetailMenuButton } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-menu-button";
import { SongDetailContent } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-content";
import { SongCommentArea } from "@/components/elements/design/song/song-detail-card/default/parts/song-comment-area";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  selectedMusicSheetIds: Array<string>
  setMusicSheetIds: (musicSheetIds: string[]) => void
  readOnly: boolean
  isStatic: boolean // true if the song-board is beginning or ending song-board. Otherwise, false.
  onSelectHandler: () => void
}

export function AddableSongDetailDialog({ teamId, isOpen, setIsOpen, songId, selectedMusicSheetIds, setMusicSheetIds, readOnly = false, isStatic = false, onSelectHandler }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }))

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-5/6 p-0 border-0 ">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide rounded-lg bg-blue-500">
          <MusicKeySelector
            teamId={teamId}
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
                  <SongDetailMenuButton teamId={teamId} songId={song?.id} songTitle={song?.title} />
                </div>
              }
              <DrawerTitle className="text-center text-3xl font-bold">{song?.title}</DrawerTitle>
              {
                song?.subtitle &&
                <div className="text-center text-xl font-semibold">({song?.subtitle})</div>
              }
              <p className="text-center font-semibold text-gray-500">{song?.original.author}</p>
            </DrawerHeader>
            <SongDetailContent songId={songId} />
            <div className="w-full flex-center">
              <SongCommentArea teamId={teamId} songId={songId} />
            </div>
            <div className="w-full mt-6">
              <DrawerClose asChild>
                <Button className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl">
                  Done
                </Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
