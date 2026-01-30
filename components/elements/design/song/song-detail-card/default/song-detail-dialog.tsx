import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Suspense, useEffect, useState, useMemo } from "react";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";
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
  const songLoadable = useRecoilValueLoadable(songAtom({ teamId, songId }));
  const musicSheetIdsLoadable = useRecoilValueLoadable(musicSheetIdsAtom({ teamId, songId }));

  const song = songLoadable.state === 'hasValue' ? songLoadable.contents : null;
  const musicSheetIds = useMemo(() =>
    musicSheetIdsLoadable.state === 'hasValue' ? musicSheetIdsLoadable.contents : [],
    [musicSheetIdsLoadable]
  );

  const [selectedMusicSheetId, setSelectedMusicSheetId] = useState<string>("");

  useEffect(() => {
    if (musicSheetIds && musicSheetIds.length > 0) {
      setSelectedMusicSheetId(musicSheetIds[0]);
    }
  }, [musicSheetIds]);

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent className="h-screen rounded-none flex flex-col focus:outline-none mt-0">
        <DrawerTitle className="hidden">{song?.title || "Song Detail"}</DrawerTitle>
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between p-3 border-b bg-background/80 backdrop-blur-md shrink-0 z-20 h-[60px]">

          {/* Left: Close Button */}
          <div className="relative z-10 flex items-center justify-start w-[80px]">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="-ml-2 hover:bg-muted/50">
              <X className="h-6 w-6 text-muted-foreground" />
            </Button>
          </div>

          {/* Center: Title & Subtitle (Absolute) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-180px)] flex flex-col items-center justify-center pointer-events-none">
            <h3 className="font-bold text-[15px] leading-tight text-center text-foreground line-clamp-2">
              {song?.title || "Untitled"}
            </h3>
            {song?.subtitle && (
              <p className="text-[11px] text-muted-foreground font-medium text-center mt-0.5 line-clamp-1">
                {song.subtitle}
              </p>
            )}
          </div>

          {/* Right: Menu Button */}
          <div className="relative z-10 flex items-center justify-end gap-1 w-[80px]">
            <SongDetailMenuButton teamId={teamId} songId={songId} songTitle={song?.title} readOnly={readOnly} />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-muted/30 relative">
          <Suspense fallback={<div className="h-full flex-center">Loading...</div>}>

            {/* Floating Key Selector (Overlay) */}
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 px-3 text-sm font-semibold bg-card/90 backdrop-blur shadow-sm border-border hover:bg-card gap-2">
                    <Suspense fallback={<span>-</span>}>
                      {selectedMusicSheetId ? <SelectedKeyTrigger teamId={teamId} songId={songId} musicSheetId={selectedMusicSheetId} /> : <span>Key</span>}
                    </Suspense>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 max-h-[50vh] overflow-y-auto z-[100]">
                  <Suspense fallback={<div className="p-2 text-sm text-muted-foreground">Loading keys...</div>}>
                    {musicSheetIds?.map((id) => (
                      <KeyDropdownItem
                        key={id}
                        teamId={teamId}
                        songId={songId}
                        musicSheetId={id}
                        onSelect={() => setSelectedMusicSheetId(id)}
                      />
                    ))}
                  </Suspense>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Full Screen Sheet Area */}
            <div className="w-full min-h-[calc(100vh-70px)] flex flex-col pb-12">
              {selectedMusicSheetId && (
                <SongDetailMusicSheetArea teamId={teamId} songId={songId} musicSheetId={selectedMusicSheetId} />
              )}
            </div>

            {/* Info Section (Below) */}
            <div className="bg-card p-4 pb-10 rounded-t-xl -mt-4 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
              <SongDetailContent teamId={teamId} songId={songId} />
            </div>

          </Suspense>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SelectedKeyTrigger({ teamId, songId, musicSheetId }: { teamId: string, songId: string, musicSheetId: string }) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }));
  return <span className="truncate max-w-[12ch] inline-block align-bottom">{musicSheet?.key || "?"}</span>;
}

function KeyDropdownItem({ teamId, songId, musicSheetId, onSelect }: { teamId: string, songId: string, musicSheetId: string, onSelect: () => void }) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }));
  return (
    <DropdownMenuItem onClick={(e) => {
      e.stopPropagation();
      onSelect();
    }} className="cursor-pointer">
      {musicSheet?.key || "Unknown Key"}
    </DropdownMenuItem>
  );
}
