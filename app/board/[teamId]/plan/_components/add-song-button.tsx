'use client'

import {Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Suspense} from "react";
import {Button} from "@/components/ui/button";
import {SelectSongListView} from "@/app/board/[teamId]/create-plan/_components/select-song-list-view";
import {LoadingCircle} from "@/components/animation/loading-indicator";
import {useRecoilState} from "recoil";
import {songSearchInputAtom} from "@/app/board/_states/board-states";

interface Props {
  teamId: string
}

export function AddSongButton({teamId}: Props) {
  const [input, setInput] = useRecoilState(songSearchInputAtom)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group w-full flex-center h-28 p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
          <p className="text-gray-400 group-hover:text-gray-500">click to add song</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl h-[90%]">
        <div className="w-full overflow-y-scroll scrollbar-hide">
          <DialogTitle>
            Select Song
          </DialogTitle>
          <div className="w-full min-h-[80%] mt-10 flex-col">
            <div className="w-full relative px-2">
              <Search className="absolute top-1/2 left-5 transform -translate-y-1/2 text-muted-foreground h-5 w-5"/>
              <Input
                className="w-full pl-12 py-6"
                placeholder="Search songs"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
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
