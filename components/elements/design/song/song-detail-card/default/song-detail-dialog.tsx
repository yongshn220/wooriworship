import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Suspense, useEffect, useState, useMemo } from "react";
import { useRecoilValueLoadable } from "recoil";
import { X } from "lucide-react";

import { songAtom } from "@/global-states/song-state";
import { musicSheetIdsAtom } from "@/global-states/music-sheet-state";

import { SongDetailContent } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-content";
import { SongDetailMusicSheetArea } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-music-sheet-area";
import { Button } from "@/components/ui/button";
import { SongDetailMenuButton } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-menu-button";
import { SongErrorBoundary } from "@/app/board/[teamId]/(song)/song-board/_components/song-error-boundary";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
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
      <DrawerContent className="h-[95dvh] rounded-none flex flex-col focus:outline-none mt-0">
        <DrawerTitle className="hidden">{song?.title || "Song Detail"}</DrawerTitle>
        {/* Top Header Bar */}
        <div className="relative flex items-center justify-between p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] border-b bg-background/80 backdrop-blur-md shrink-0 z-10 min-h-[60px]">

          {/* Left: Close Button */}
          <div className="relative z-10 flex items-center justify-start w-[80px]">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="-ml-2 hover:bg-muted/50" aria-label="Close dialog">
              <X className="h-6 w-6 text-muted-foreground" />
            </Button>
          </div>

          {/* Center: Title & Subtitle (Absolute) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-180px)] flex flex-col items-center justify-center pointer-events-none z-0">
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
          <SongErrorBoundary fallbackMessage="Failed to load song details. Please try again.">
            <Suspense fallback={<SongDetailSkeleton />}>

              {/* Full Screen Sheet Area */}
              <div className="w-full min-h-[calc(100dvh-70px)] flex flex-col pb-12">
                {selectedMusicSheetId && (
                  <SongDetailMusicSheetArea
                    teamId={teamId}
                    songId={songId}
                    musicSheetId={selectedMusicSheetId}
                    musicSheetIds={musicSheetIds}
                    onMusicSheetChange={setSelectedMusicSheetId}
                  />
                )}
              </div>

              {/* Info Section (Below) */}
              <div className="bg-card p-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] rounded-t-xl -mt-4 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
                <SongDetailContent teamId={teamId} songId={songId} />
              </div>

            </Suspense>
          </SongErrorBoundary>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SongDetailSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Sheet Area Skeleton */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full aspect-[3/4] max-h-[calc(100vh-200px)] bg-muted rounded-lg" />
      </div>
      {/* Info Section Skeleton */}
      <div className="bg-card p-4 pb-10 rounded-t-xl -mt-4 space-y-4">
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
        <div className="flex justify-between items-center">
          <div className="h-5 w-12 bg-muted rounded" />
          <div className="h-5 w-28 bg-muted rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 w-10 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded-full" />
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}
