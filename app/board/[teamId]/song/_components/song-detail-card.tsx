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
import {Song} from "@/models/song";
import Image from "next/image"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {getPathSongEdit} from "@/components/helper/routes";
import {DeleteSongButton} from "@/app/board/[teamId]/song/_components/delete-song-button";
import TextLinkify from "@/components/text-linkify";

interface Props {
  isOpen: boolean
  setIsOpen: Function
  song: Song
  editable: boolean
}

export function SongDetailCard({isOpen, setIsOpen, song, editable=false}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)

  return (
    <Dialog open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
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
              <TextLinkify>
                <p className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  {song?.original.url}
                </p>
              </TextLinkify>
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
              song.music_sheet_urls.length > 0 &&
              <div className="flex-start flex-col w-full items-center gap-1.5">
                <div className="flex-center w-full aspect-[2/1] p-2 rounded-md">
                  <div className="flex-start w-full h-full gap-4 overflow-x-auto">
                    {
                      song.music_sheet_urls.map((url: string, i: number) => (
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
              <DeleteSongButton songTitle={song?.title} songId={song?.id}/>
              <Link href={getPathSongEdit(teamId, song.id)}>
                <Button>
                  Edit
                </Button>
              </Link>
            </DialogFooter>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}
