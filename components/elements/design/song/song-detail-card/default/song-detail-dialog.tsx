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
import { SongDetailMenuButton } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-menu-button";

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
        <div className="relative flex items-center justify-between p-3 border-b bg-white/80 backdrop-blur-md shrink-0 z-20 h-[60px]">

          {/* Left: Close Button */}
          <div className="relative z-10 flex items-center justify-start w-[80px]">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="-ml-2 hover:bg-gray-100/50">
              <X className="h-6 w-6 text-gray-600" />
            </Button>
          </div>

          {/* Center: Title & Subtitle (Absolute) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-180px)] flex flex-col items-center justify-center pointer-events-none">
            <h3 className="font-bold text-[15px] leading-tight text-center text-gray-900 line-clamp-2">
              {song?.title || "Untitled"}
            </h3>
            {song?.subtitle && (
              <p className="text-[11px] text-gray-500 font-medium text-center mt-0.5 line-clamp-1">
                {song.subtitle}
              </p>
            )}
          </div>

          {/* Right: Key Selector & Menu */}
          <div className="relative z-10 flex items-center justify-end gap-1 w-[80px]">
            {/* Key Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-gray-600 gap-1 hover:bg-gray-100/50">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
                    <Suspense fallback={<span>-</span>}>
                      {selectedMusicSheetId ? <SelectedKeyTrigger musicSheetId={selectedMusicSheetId} /> : <span>-</span>}
                    </Suspense>
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 max-h-[50vh] overflow-y-auto z-[100]">
                <Suspense fallback={<div className="p-2 text-sm text-gray-400">Loading keys...</div>}>
                  {musicSheetIds?.map((id) => (
                    <KeyDropdownItem
                      key={id}
                      musicSheetId={id}
                      onSelect={() => setSelectedMusicSheetId(id)}
                    />
                  ))}
                </Suspense>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu Button */}
            <SongDetailMenuButton teamId={teamId} songId={songId} songTitle={song?.title} />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
          <Suspense fallback={<div className="h-full flex-center">Loading...</div>}>

            {/* Full Screen Sheet Area */}
            <div className="w-full min-h-[calc(100vh-70px)] flex flex-col pb-12">
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
    <DropdownMenuItem onClick={(e) => {
      e.stopPropagation();
      onSelect();
    }} className="cursor-pointer">
      {musicSheet?.key || "Unknown Key"}
    </DropdownMenuItem>
  );
}
