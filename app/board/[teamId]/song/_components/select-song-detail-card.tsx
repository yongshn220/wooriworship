'use client'

import {Dialog, DialogContentNoCloseButton, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {MenuButton} from "@/app/board/[teamId]/song/_components/menu-button";
import React from "react";
import {Button} from "@/components/ui/button";
import {useRecoilState, useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {SongCommentArea} from "@/app/board/[teamId]/song/_components/song-comment-area";
import {SongDetailContent} from "@/app/board/[teamId]/song/_components/song-detail-content";
import {cn} from "@/lib/utils";
import {selectedWorshipSongHeaderListAtom, worshipBeginningSongHeaderAtom, worshipEndingSongHeaderAtom} from "@/app/board/[teamId]/plan/_components/status";
import {toast} from "@/components/ui/use-toast";
import {musicSheetAtom, musicSheetIdsAtom, musicSheetsBySongIdAtom} from "@/global-states/music-sheet-state";

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

export function SelectSongDetailCard({teamId, isOpen, setIsOpen, songId, selectedMusicSheetIds, setMusicSheetIds, readOnly=false, isStatic=false, onSelectHandler}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const musicSheets = useRecoilValue(musicSheetsBySongIdAtom(songId))
  const [selectedSongHeaderList, setSelectedSongHeaderList] = useRecoilState(selectedWorshipSongHeaderListAtom)
  const beginningSongWrapper = useRecoilState(worshipBeginningSongHeaderAtom)
  const endingSongWrapper = useRecoilState(worshipEndingSongHeaderAtom)

  function handleSelectSong() {
    if (isStatic) return

    onSelectHandler()
  }

  function handleUnselectSong() {
    if (isStatic) return
    onSelectHandler()
  }

  function handleKeyClick(key: string) {
    if (isStatic) {
      setMusicSheetIds([key])
    }
    else {
      if (isKeySelected(key)) {
        setMusicSheetIds([...selectedKeys.filter((_key) => _key !== key)])
      }
      else {
        console.log(key)
        setMusicSheetIds([...selectedKeys, key])
      }
    }
  }

  function isKeySelected(key: string) {
    return selectedKeys.includes(key)
  }

  function isSongAdded() {
    return selectedSongHeaderList.map((songWrapper => songWrapper?.song?.id)).includes(songId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DialogContentNoCloseButton className="sm:max-w-[600px] h-5/6 p-0 border-0 rounded-lg">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide rounded-lg bg-blue-500">
          <div className="flex-between flex-col h-4/5 p-6 text-white">
            <div className="w-full h-full flex-center flex-col gap-4">
              <p className="text-3xl font-semibold">Select Keys</p>
              <div className="flex-center gap-2">
                {
                  musicSheets?.map((sheet, index) => (
                    <div
                      key={index}
                      className={
                        cn(
                          "flex-center w-16 h-16 border-2 border-white text-white rounded-lg cursor-pointer",
                          {"bg-white text-black": isKeySelected(sheet?.key)},
                        )
                      }
                      onClick={() => handleKeyClick(sheet?.key)}
                    >
                      {sheet?.key}
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="w-full flex-center flex-col gap-2">
              {
                isStatic === false &&
                <>
                  <p className="text-black">selected: {selectedKeys.join(", ")}</p>
                  {
                    isSongAdded()
                    ? <Button className="w-full bg-blue-500 hover:bg-blue-500 hover:border-2 hover:text-white" variant="outline" onClick={() => handleUnselectSong()}>Click to Remove Song</Button>
                    : <Button className="w-full" onClick={() => handleSelectSong()}>Click to Add Song</Button>
                  }
                </>
              }
            </div>
          </div>
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

