'use client'

import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Suspense} from "react";
import {Button} from "@/components/ui/button";
import {SelectSongListView} from "@/app/board/[teamId]/(worship)/create-worship/_components/select-song-list-view";
import {LoadingCircle} from "@/components/animation/loading-indicator";
import {useRecoilState, useRecoilValue} from "recoil";
import {songSearchInputAtom} from "@/app/board/_states/board-states";
import {Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {Separator} from "@/components/ui/separator";
import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import {SelectedSongIndicatingBadge} from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-board-form/selected-song-indicating-badge";

interface Props {
  teamId: string
}

export function AddSongButtonDrawer({teamId}: Props) {
  const [input, setInput] = useRecoilState(songSearchInputAtom)
  const selectedSongHeaderList = useRecoilValue(selectedWorshipSongHeaderListAtom)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="group w-full flex-center h-28 p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 cursor-pointer">
          <p className="text-gray-400 group-hover:text-gray-500">click to add song</p>
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-[90%]">
        <div className="w-full overflow-y-scroll scrollbar-hide p-1">
          <DrawerHeader>
            {/*<div className="absolute right-4 top-4 text-blue-500 cursor-pointer hover:text-blue-600">*/}
            {/*  Close*/}
            {/*</div>*/}
          </DrawerHeader>
          <VisuallyHidden>
            <DrawerTitle>
              Select Song
            </DrawerTitle>
          </VisuallyHidden>
          <div className="w-full flex-col">
            <div className="w-full relative">
              <Search className="absolute top-1/2 left-5 transform -translate-y-1/2 text-muted-foreground h-5 w-5"/>
              <Input
                className="w-full pl-12 py-6 border-0 custom-input-focus"
                placeholder="Search songs"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Separator/>
            </div>
            <div className="space-x-2 space-y-2">
              {
                selectedSongHeaderList?.map((songHeader, index) => (
                  <SelectedSongIndicatingBadge key={index} songId={songHeader?.id} />
                ))
              }
            </div>
            <div className="overflow-y-scroll">
              <Suspense fallback={<LoadingCircle/>}>
                <SelectSongListView teamId={teamId}/>
              </Suspense>
            </div>
          </div>
          <div className="w-full mt-10">
            <div className="w-full flex-center">
              <DrawerClose asChild>
                <Button className="w-[60px]">Done</Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
