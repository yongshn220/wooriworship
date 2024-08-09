'use client'

import {Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Suspense} from "react";
import {Button} from "@/components/ui/button";
import {SelectSongListView} from "@/app/board/[teamId]/create-plan/_components/select-song-list-view";
import {LoadingCircle} from "@/components/animation/loading-indicator";
import {useRecoilState, useRecoilValue} from "recoil";
import {songSearchInputAtom} from "@/app/board/_states/board-states";
import {Badge} from "@/components/ui/badge";
import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/plan/_components/status";
import {songAtom} from "@/global-states/song-state";
import {
  SelectSongDetailCardWrapper
} from "@/app/worship/[teamId]/[worshipId]/_components/select-song-detail-card-wrapper";

interface Props {
  teamId: string
}

export function AddSongButton({teamId}: Props) {
  const [input, setInput] = useRecoilState(songSearchInputAtom)
  const selectedSongHeaderList = useRecoilValue(selectedWorshipSongHeaderListAtom)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group w-full flex-center h-28 p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
          <p className="text-gray-400 group-hover:text-gray-500">click to add song</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[90%] p-4">
        <div className="w-full overflow-y-scroll scrollbar-hide p-1">
          <DialogTitle>
            Select Song
          </DialogTitle>
          <div className="w-full min-h-[80%] mt-10 flex-col">
            <div className="w-full relative">
              <Search className="absolute top-1/2 left-5 transform -translate-y-1/2 text-muted-foreground h-5 w-5"/>
              <Input
                className="w-full pl-12 py-6"
                placeholder="Search songs"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="space-x-2 space-y-2">
              {
                selectedSongHeaderList?.map((songHeader, index) => (
                  <SongBadge key={index} songId={songHeader?.id} />
                ))
              }
            </div>
            <Suspense fallback={<LoadingCircle/>}>
              <SelectSongListView teamId={teamId}/>
            </Suspense>
          </div>
          <div className="w-full mt-10">
            <div className="w-full flex-center">
              <DialogClose asChild>
                <Button className="w-[60px]">Done</Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SongBadgeProps {
  songId: string
}

function SongBadge({songId}: SongBadgeProps) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <Badge variant="outline">{song?.title}</Badge>
  )
}
