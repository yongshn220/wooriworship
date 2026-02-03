'use client'

import * as React from "react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { AddableSongHeaderList } from "@/components/elements/design/song/song-list/setlist-form/parts/addable-song-header-list";
import { LoadingCircle } from "@/components/util/animation/loading-indicator";
import { useRecoilValue } from "recoil";
import { songSearchInputAtom } from "@/app/board/_states/board-states";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DrawerFloatingFooter, DrawerDoneButton } from "@/components/common/drawer-floating-footer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchInput } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-input";
import { SearchFilterPopover } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-filter-popover";
import { ActiveFilterList } from "@/app/board/_components/active-filter-list";
import { ListFilter } from "lucide-react";
import { SetlistSongHeader } from "@/models/setlist";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  selectedSongs: SetlistSongHeader[]
  onUpdateList: (newSongs: SetlistSongHeader[]) => void
}

export function AddSetlistSongDialog({ teamId, isOpen, setIsOpen, selectedSongs, onUpdateList }: Props) {
  const input = useRecoilValue(songSearchInputAtom)
  // const selectedSongHeaderList = useRecoilValue(selectedWorshipSongHeaderListAtom) // REMOVED

  // State for "Cart" view
  const [showSelectedOnly, setShowSelectedOnly] = React.useState(false)
  // State for keyboard visibility (hide bottom bar when typing)
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)

  // Reset view when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowSelectedOnly(false)
      setIsSearchFocused(false)
    }
  }, [isOpen])

  const selectedCount = selectedSongs.length

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-[90vh] rounded-t-[2.5rem]">
        <div className="w-full h-full flex flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 p-0">
          </DrawerHeader>
          <VisuallyHidden>
            <DrawerTitle>
              Select Song
            </DrawerTitle>
          </VisuallyHidden>

          {/* Header Search Area */}
          <div className="w-full shrink-0 px-4 pt-4 pb-2 relative">
            {/* Header Search Area */}
            {!showSelectedOnly ? (
              <>
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1">
                    <SearchInput
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    />
                  </div>
                  <SearchFilterPopover>
                    <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full">
                      <ListFilter className="h-4 w-4" />
                    </Button>
                  </SearchFilterPopover>
                </div>
                {/* Active Filters */}
                <ActiveFilterList />
              </>
            ) : (
              <div className="w-full py-2 flex items-center justify-between">
                <h2 className="text-xl font-bold">Selected Songs</h2>
              </div>
            )}


          </div>

          {/* Scrollable Song List */}
          <div className={cn(
            "flex-1 overflow-y-auto no-scrollbar transition-all duration-200 pb-48",
            isSearchFocused && "max-md:pb-4"
          )}>
            <Suspense fallback={<LoadingCircle />}>
              <AddableSongHeaderList
                teamId={teamId}
                showSelectedOnly={showSelectedOnly}
                selectedSongs={selectedSongs}
                onUpdateList={onUpdateList}
              />
            </Suspense>
          </div>

          {/* Bottom Floating Action Bar - hidden on mobile when keyboard is open */}
          <DrawerFloatingFooter
            hidden={isSearchFocused}
            className={cn(isSearchFocused && "max-md:translate-y-full max-md:opacity-0")}
          >
            <DrawerClose asChild>
              <DrawerDoneButton />
            </DrawerClose>

            {/* Cart Toggle Button */}
            <Button
              variant={showSelectedOnly ? "default" : "outline"}
              onClick={() => setShowSelectedOnly(!showSelectedOnly)}
              className={cn(
                "h-14 aspect-square rounded-full relative shadow-lg transition-all active:scale-95 shrink-0 border-2",
                showSelectedOnly ? "bg-primary hover:bg-primary/90 text-primary-foreground border-transparent" : "bg-background border-primary/20 text-primary hover:bg-primary/5"
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
          </DrawerFloatingFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
