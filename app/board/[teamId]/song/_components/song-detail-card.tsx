'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {EditButton} from "@/app/board/[teamId]/song/_components/edit-button";
import { StorageService } from "@/apis";
import { useEffect, useState } from "react";
import {Song} from "@/models/song";
import Image from "next/image"

interface Props {
  isOpen: boolean
  setIsOpen: any
  song: Song
  editable: boolean
}

export function SongDetailCard({isOpen, setIsOpen, song, editable=false}: Props) {
  const [musicSheetUrls, setMusicSheetUrls] = useState<any>([])

  useEffect(() => {
    Promise.all(song.storage_location.map(image => StorageService.downloadMusicSheet(song.team_id, song.id, image))).then(_urls => {
      setMusicSheetUrls(_urls);
      console.log(_urls)
    })
  }, [song.id, song.team_id, song.storage_location])


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] h-5/6">
        <div className="w-full h-full overflow-y-scroll scrollbar-hide">
          <DialogHeader>
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
              <p className="text-blue-500 hover:text-blue-600 cursor-pointer">
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
            <div className="flex-start flex-col items-center gap-1.5 p-4 bg-gray-100 rounded-lg">
              <div className="whitespace-pre-wrap">
                {song.description}
              </div>
            </div>
            {
              musicSheetUrls.length > 0 &&
              <div className="flex-start flex-col w-full items-center gap-1.5">
                <div className="flex-center w-full aspect-[2/1] p-2 rounded-md">
                  <div className="flex-start w-full h-full gap-4 overflow-x-auto">
                    {
                      musicSheetUrls.map((url: string, i: number) => (
                        <div key={i} className="flex flex-col h-full aspect-[3/4] pb-1">
                          <div className="relative flex-1 bg-gray-200 rounded-md">
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
          {
            editable &&
            <DialogFooter className="mt-10">
              <EditButton song={song}/>
            </DialogFooter>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
