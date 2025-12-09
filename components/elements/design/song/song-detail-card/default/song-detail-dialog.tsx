import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Suspense, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { X, ChevronDown } from "lucide-react";

import { songAtom } from "@/global-states/song-state";
import { musicSheetAtom, musicSheetIdsAtom } from "@/global-states/music-sheet-state";

import { SongDetailContent } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-content";
import { SongDetailMusicSheetArea } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-music-sheet-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: Function
  songId: string
  readOnly: boolean
}

export function SongDetailDialog({ teamId, isOpen, setIsOpen, songId, readOnly = false }: Props) {
  const song = useRecoilValue(songAtom(songId));
  const musicSheetIds = useRecoilValue(musicSheetIdsAtom(songId));
  const [selectedMusicSheetId, setSelectedMusicSheetId] = useState<string>("");

  useEffect(() => {
    if (musicSheetIds && musicSheetIds.length > 0) {
      setSelectedMusicSheetId(musicSheetIds[0]);
    }
  }, [musicSheetIds]);

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-screen rounded-none flex flex-col focus:outline-none mt-0">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-3 border-b bg-white z-20 shrink-0 gap-2">
          {/* Key Selector (Dropdown) */}
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[4.5rem] justify-between px-3">
                  {selectedMusicSheetId ? <SelectedKeyTrigger musicSheetId={selectedMusicSheetId} /> : <span>Key</span>}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-[50vh] overflow-y-auto">
                {musicSheetIds?.map((id) => (
                  <KeyDropdownItem
                    key={id}
                    musicSheetId={id}
                    onSelect={() => setSelectedMusicSheetId(id)}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title (Center) */}
          <div className="flex-1 px-2 text-center min-w-0">
            <h3 className="font-bold text-lg leading-tight break-keep line-clamp-2 truncate">
              {song?.title || "Untitled"}
            </h3>
          </div>

          {/* Exit (Right) */}
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
          <Suspense fallback={<div className="h-full flex-center">Loading...</div>}>

            {/* Full Screen Sheet Area */}
            <div className="w-full min-h-[calc(100vh-70px)] flex flex-col">
              {selectedMusicSheetId && (
                <SongDetailMusicSheetArea musicSheetId={selectedMusicSheetId} />
              )}
            </div>

            {/* Info Section (Below) */}
            <div className="bg-white p-4 pb-10 rounded-t-xl -mt-4 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <SongDetailContent songId={songId} />
            </div>

          </Suspense>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SelectedKeyTrigger({ musicSheetId }: { musicSheetId: string }) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId));
  return <span className="truncate max-w-[8rem]">{musicSheet?.key || "?"}</span>;
}

function KeyDropdownItem({ musicSheetId, onSelect }: { musicSheetId: string, onSelect: () => void }) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId));
  return (
    <DropdownMenuItem onClick={onSelect} className="cursor-pointer">
      {musicSheet?.key || "Unknown Key"}
    </DropdownMenuItem>
  );
}
