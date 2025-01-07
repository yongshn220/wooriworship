'use client'

import {Dialog, DialogContentNoCloseButton, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import React from "react";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SelectSongMusicSheetKey} from "@/app/board/[teamId]/(song)/song-board/_components/select-song-music-sheet-key";
import {SongDetailContent} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-card/song-detail-content";
import {SongCommentArea} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-card/song-comment-area";

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

export function SelectSongDetailCard({teamId, isOpen, setIsOpen, songId, selectedMusicSheetIds, setMusicSheetIds, readOnly=false, isStatic=false, onSelectHandler}: Props) {
  const song = useRecoilValue(songAtom(songId))



  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContentNoCloseButton className="sm:max-w-[600px] h-5/6 p-0 border-0 rounded-lg">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide rounded-lg bg-blue-500">
          <SelectSongMusicSheetKey
            songId={songId}
            isStatic={isStatic}
            onSelectHandler={onSelectHandler}
            selectedMusicSheetIds={selectedMusicSheetIds}
            setMusicSheetIds={setMusicSheetIds}
          />
          <div className="w-full p-6 bg-white rounded-lg">
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
        </div>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}

