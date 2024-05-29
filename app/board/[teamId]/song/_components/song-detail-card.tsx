'use client'

import {Dialog, DialogContentNoCloseButton, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Song} from "@/models/song";
import Image from "next/image"
import {OpenYoutubeLink, timestampToDatePassedFromNow} from "@/components/helper/helper-functions";
import {MenuButton} from "@/app/board/[teamId]/song/_components/menu-button";

interface Props {
  isOpen: boolean
  setIsOpen: Function
  song: Song
  readOnly: boolean
}

export function SongDetailCard({isOpen, setIsOpen, song, readOnly=false}: Props) {
  function handleLinkButtonClick() {
    if (song?.original?.url) {
      OpenYoutubeLink(song.original.url)
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
                <MenuButton songId={song?.id} songTitle={song?.title}/>
              </div>
            }
            <DialogTitle className="text-center text-3xl font-bold">{song?.title}</DialogTitle>
            <p className="text-center font-semibold text-gray-500">{song.original.author}</p>
          </DialogHeader>
          <div className="grid gap-6 w-full mt-10">
            <div className="flex-between items-center">
              <Label htmlFor="name" className="text-base font-semibold">
                Version
              </Label>
              <p>{song?.version}</p>
            </div>
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
              <p className="text-blue-500 hover:text-blue-600 cursor-pointer" onClick={handleLinkButtonClick}>
                {song?.original.url}
              </p>
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
            <div className="flex-between items-center">
              <Label htmlFor="name" className="text-base font-semibold">
                Last Used Date
              </Label>
              <p className="text-sm" >{timestampToDatePassedFromNow(song?.last_used_time)}</p>
            </div>
            <div className="flex-start flex-col items-center gap-1.5 p-4 bg-gray-100 rounded-lg">
              <div className="whitespace-pre-wrap">
                {song.description}
              </div>
            </div>
            {
              song.music_sheet_urls.length > 0 &&
              <div className="flex-start flex-col w-full items-center gap-1.5">
                <div className="flex-center w-full aspect-[2/1] p-2 rounded-md">
                  <div className="flex-start w-full h-full gap-4 overflow-x-auto">
                    {
                      song.music_sheet_urls.map((url: string, i: number) => (
                        <div key={i}
                             className="flex flex-col h-full aspect-[3/4] pb-1 border-2 rounded-lg hover:border-gray-300 cursor-pointer">
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
          </div>
        </div>
      </DialogContentNoCloseButton>
    </Dialog>
  )
}
