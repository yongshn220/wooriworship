'use client'

import { Search } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
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

  // State for "Cart" view
  const [showSelectedOnly, setShowSelectedOnly] = React.useState(false)

  // Reset view when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) setShowSelectedOnly(false)
  }, [isOpen])

  const selectedCount = selectedSongHeaderList.length

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-[90%]">
        <div className="w-full h-full flex flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 p-0">
          </DrawerHeader>
          <VisuallyHidden>
            <DrawerTitle>
              Select Song
            </DrawerTitle>
          </VisuallyHidden>

          {/* Header Search Area */}
          <div className="w-full shrink-0 px-1 relative">
            <div className="w-full relative">
              <Search className="absolute top-1/2 left-5 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                className="w-full pl-12 py-6 border-0 custom-input-focus text-lg"
                placeholder={showSelectedOnly ? "Start searching to add more songs..." : "Search songs"}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (e.target.value.length > 0 && showSelectedOnly) setShowSelectedOnly(false)
                }}
              />
              <Separator />
            </div>

            {/* Mode Indicator Toast/Banner (Optional, but helps UX) */}
            {showSelectedOnly && (
              <div className="bg-blue-50 text-blue-600 px-6 py-2 text-sm font-medium flex justify-between items-center">
                <span>Reviewing Selected Songs</span>
                <button onClick={() => setShowSelectedOnly(false)} className="underline text-xs">View All</button>
              </div>
            )}
          </div>

          {/* Scrollable Song List */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            <Suspense fallback={<LoadingCircle />}>
              <AddableSongHeaderList teamId={teamId} showSelectedOnly={showSelectedOnly} />
            </Suspense>
          </div>

          {/* Bottom Floating Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-10">
            <div className="flex gap-3 max-w-md mx-auto">
              {/* Done Button */}
              <DrawerClose asChild>
                <Button className="h-14 flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl transition-all active:scale-95">
                  Done
                </Button>
              </DrawerClose>

              {/* Cart Toggle Button */}
              <Button
                variant={showSelectedOnly ? "default" : "outline"}
                onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                className={cn(
                  "h-14 aspect-square rounded-full relative shadow-lg transition-all active:scale-95 shrink-0 border-2",
                  showSelectedOnly ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : "bg-white border-blue-100 text-blue-600 hover:bg-blue-50"
                )}
              >
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[10px] font-bold uppercase mb-0.5">{showSelectedOnly ? "ALL" : "CART"}</span>
                  <span className="text-lg font-black">{selectedCount}</span>
                </div>
                {/* Badge Overlay if not in selected view and has items */}
                {!showSelectedOnly && selectedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
