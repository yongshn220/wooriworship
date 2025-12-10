'use client'

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { AddableSongHeaderList } from "@/components/elements/design/song/song-list/worship-form/parts/addable-song-header-list";
import { LoadingCircle } from "@/components/util/animation/loading-indicator";
import { useRecoilState, useRecoilValue } from "recoil";
import { songSearchInputAtom } from "@/app/board/_states/board-states";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Separator } from "@/components/ui/separator";
import { selectedWorshipSongHeaderListAtom } from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import { SongTitleBadge } from "@/components/elements/design/song/song-list/worship-form/parts/song-title-badge";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
}

export function AddWorshipSongDialog({ teamId, isOpen, setIsOpen }: Props) {
  const [input, setInput] = useRecoilState(songSearchInputAtom)
  const selectedSongHeaderList = useRecoilValue(selectedWorshipSongHeaderListAtom)

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-[90%]">
        <div className="w-full overflow-y-scroll scrollbar-hide p-1">
          <DrawerHeader>
          </DrawerHeader>
          <VisuallyHidden>
            <DrawerTitle>
              Select Song
            </DrawerTitle>
          </VisuallyHidden>
          <div className="w-full flex-col">
            <div className="w-full relative">
              <Search className="absolute top-1/2 left-5 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                className="w-full pl-12 py-6 border-0 custom-input-focus"
                placeholder="Search songs"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Separator />
            </div>

            <div className="overflow-y-scroll">
              <Suspense fallback={<LoadingCircle />}>
                <AddableSongHeaderList teamId={teamId} />
              </Suspense>
            </div>
          </div>
          <div className="absolute bottom-10 left-0 right-0 px-6">
            <div className="w-full flex-center">
              <DrawerClose asChild>
                <Button className="w-full max-w-sm h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl">Done</Button>
              </DrawerClose>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
