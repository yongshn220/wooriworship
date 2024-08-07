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

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailDrawer({teamId, isOpen, setIsOpen, songId, readOnly=false}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const [isMusicSheetViewOpen, setMusicSheetViewOpen] = useState(false)

  function handleLinkButtonClick() {
    if (song?.original?.url) {
      OpenYoutubeLink(song.original.url)
    }
  }

  function handleMusicSheetClick() {
    setMusicSheetViewOpen(true)
  }

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <SongMusicSheetViewer isOpen={isMusicSheetViewOpen} setIsOpen={setMusicSheetViewOpen} musicSheetUrls={song?.music_sheet_urls}/>
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
              <p>{song?.key}</p>
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
              song.description &&
              <div className="flex-start flex-col items-center gap-1.5 p-4 bg-gray-100 rounded-lg">
                <div className="whitespace-pre-wrap">
                  {song.description}
                </div>
              </div>
            }
            {
              song.music_sheet_urls.length > 0 &&
              <div className="flex-start flex-col w-full items-center gap-1.5">
                <div className="flex-center w-full aspect-[2/1] p-2 rounded-md">
                  <div className="flex-start w-full h-full gap-4 overflow-x-auto">
                    {
                      song.music_sheet_urls.map((url: string, i: number) => (
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
          </div>
          <div className="w-full flex-center">
            <SongCommentArea teamId={teamId} songId={songId}/>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
