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
import {SongKeyBox} from "@/components/song/song-key-box";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailCard({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {
  const song = useRecoilValue(songAtom(songId))

  function handleLinkButtonClick() {
    if (song?.original?.url) {
      OpenYoutubeLink(song?.original.url)
    }
  }

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
            <p className="text-center font-semibold text-gray-500">{song?.original.author}</p>
          </DialogHeader>
          <div className="grid gap-6 w-full mt-10">
            {
              song?.version &&
              <div className="flex-between items-center">
                <Label htmlFor="name" className="text-base font-semibold">
                  Version
                </Label>
                <p>{song?.version}</p>
              </div>
            }
            <div className="flex-between items-center">
              <Label htmlFor="name" className="text-base font-semibold">
                Key
              </Label>
              {
                song?.music_sheets?.length > 0 && song?.music_sheets?.map((musicSheet, index) => (
                  <SongKeyBox key={index} musicKey={musicSheet?.key}/>
                ))
              }
            </div>
            <div className="flex-between items-center">
              <Label htmlFor="name" className="text-base font-semibold">
                Link
              </Label>
              <Button variant="ghost" className="text-blue-500 hover:text-blue-600 cursor-pointer gap-2 p-0" onClick={handleLinkButtonClick}>
                <LinkIcon className="w-4 h-4"/>
                <p>Go to the Link</p>
              </Button>
            </div>
            <div className="flex-between items-center">
              <Label htmlFor="name" className="text-base font-semibold">
                Tags
              </Label>
              <div className="w-full text-right space-x-2 pl-20">
                {
                  song?.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))
                }
              </div>
            </div>
            {
              song?.bpm &&
              <div className="flex-between items-center">
                <Label htmlFor="name" className="text-base font-semibold">
                  BPM
                </Label>
                <p>
                  {song?.bpm}
                </p>
              </div>
            }
            <div className="flex-between items-center">
              <Label htmlFor="name" className="text-base font-semibold">
                Used on
              </Label>
              <p className="text-sm">{getTimePassedFromTimestamp(song?.last_used_time)}</p>
            </div>
            {
              song?.description &&
              <div className="flex-start flex-col items-center gap-1.5 p-4 bg-gray-100 rounded-lg">
                <div className="whitespace-pre-wrap">
                  {song?.description}
                </div>
              </div>
            }
            <div className="flex flex-col gap-4">
              <Label htmlFor="name" className="text-base font-semibold">
                Music Sheets
              </Label>
              <div className="flex-start">
                {
                  song?.music_sheets?.map((musicSheet, index) => (
                    <Badge key={index} className="cursor-pointer w-10 flex-center">{musicSheet?.key}</Badge>
                  ))
                }
              </div>
              <div>
                {
                  song?.music_sheets?.map((musicSheet, index) => (
                    <MusicSheet key={index} urls={musicSheet?.urls}/>
                  ))
                }
              </div>
            </div>
          </div>
          <div className="w-full flex-center">
            <SongCommentArea teamId={teamId} songId={songId}/>
          </div>
        </div>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}

function MusicSheet({urls}: {urls: string[]}) {
  const [isMusicSheetViewOpen, setMusicSheetViewOpen] = useState(false)

  function handleMusicSheetClick() {
    setMusicSheetViewOpen(true)
  }

  return (
    <>
      <SongMusicSheetViewer isOpen={isMusicSheetViewOpen} setIsOpen={setMusicSheetViewOpen} musicSheetUrls={urls}/>
      {
        urls.length > 0 &&
        <div className="flex-start flex-col w-full items-center gap-1.5">
          <div className="flex-center w-full aspect-[2/1] p-2 rounded-md">
            <div className="flex-start w-full h-full gap-4 overflow-x-auto">
              {
                urls.map((url: string, i: number) => (
                  <div key={i}
                       className="flex flex-col h-full aspect-[3/4] pb-1 border-2 rounded-lg hover:border-gray-300 cursor-pointer"
                       onClick={handleMusicSheetClick}>
                    <div className="relative flex-1">
                      <Image
                        src={url}
                        fill
                        sizes="20vw, 20vw, 20vw"
                        className="object-contain p-1 rounded-md"
                        alt="EventImage"
                      />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      }
    </>
  )
}
