import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useRecoilValueLoadable } from "recoil";
import { X, ChevronLeft, ChevronRight, Music2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { songAtom } from "@/global-states/song-state";
import { musicSheetIdsAtom } from "@/global-states/music-sheet-state";

import { SheetViewer } from "./parts/sheet-viewer";
import { SongMetadata } from "./parts/song-metadata";
import { Button } from "@/components/ui/button";
import { SongDetailMenuButton } from "@/components/elements/design/song/song-detail-card/default/parts/song-detail-menu-button";
import { SongErrorBoundary } from "@/app/board/[teamId]/(song)/song-board/_components/song-error-boundary";
import { cn } from "@/lib/utils";

interface Props {
  teamId: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  songId: string
  readOnly: boolean
}

export function SongDetailRedesign({ teamId, isOpen, setIsOpen, songId, readOnly = false }: Props) {
  const songLoadable = useRecoilValueLoadable(songAtom({ teamId, songId }));
  const musicSheetIdsLoadable = useRecoilValueLoadable(musicSheetIdsAtom({ teamId, songId }));

  const song = songLoadable.state === 'hasValue' ? songLoadable.contents : null;
  const musicSheetIds = useMemo(() =>
    musicSheetIdsLoadable.state === 'hasValue' ? musicSheetIdsLoadable.contents : [],
    [musicSheetIdsLoadable]
  );

  const [selectedMusicSheetId, setSelectedMusicSheetId] = useState<string>("");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (musicSheetIds && musicSheetIds.length > 0) {
      setSelectedMusicSheetId(musicSheetIds[0]);
    }
  }, [musicSheetIds]);

  // Auto-hide controls after 3 seconds of inactivity
  const showControls = () => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    if (isOpen) {
      showControls();
    }
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isOpen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    showControls();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(state) => setIsOpen(state)}>
      <DrawerContent
        className={cn(
          "h-[98dvh] rounded-t-[24px] flex flex-col focus:outline-none mt-0 border-none shadow-2xl",
          "bg-background"
        )}
        onPointerMove={showControls}
        onClick={showControls}
      >
        <DrawerTitle className="sr-only">{song?.title || "Song Detail"}</DrawerTitle>

        {/* Top Header - Auto-hiding */}
        <AnimatePresence>
          {controlsVisible && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 right-0 z-[100] pt-safe-t"
            >
              <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-xl">
                {/* Close Button */}
                <div className="relative z-10 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-11 w-11 flex-shrink-0 rounded-full hover:bg-muted/80 active:scale-95 transition-all flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Title */}
                <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 text-center">
                  <h3 className="font-semibold text-base text-foreground truncate">
                    {song?.title || "Untitled"}
                  </h3>
                  {song?.subtitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {song.subtitle}
                    </p>
                  )}
                </div>

                {/* Menu Buttons */}
                <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="h-11 w-11 flex-shrink-0 rounded-full hover:bg-muted/80 active:scale-95 transition-all flex items-center justify-center"
                    aria-label="Toggle fullscreen"
                  >
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                  <div className="flex-shrink-0">
                    <SongDetailMenuButton
                      teamId={teamId}
                      songId={songId}
                      songTitle={song?.title}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area - Vertical Scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <SongErrorBoundary fallbackMessage="Failed to load song details">
            <Suspense fallback={<SheetViewerSkeleton />}>
              {/* Sheet Viewer - Full Screen */}
              <div className="h-[100dvh]">
                {selectedMusicSheetId && (
                  <SheetViewer
                    teamId={teamId}
                    songId={songId}
                    musicSheetId={selectedMusicSheetId}
                    musicSheetIds={musicSheetIds}
                    onMusicSheetChange={setSelectedMusicSheetId}
                    controlsVisible={controlsVisible}
                    onInteraction={showControls}
                  />
                )}
              </div>

              {/* Metadata Panel - Scroll Down to View */}
              {!isFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="min-h-[100dvh] bg-background overflow-y-auto"
                >
                  <div className="max-w-2xl mx-auto p-6 pb-safe-b">
                    <SongMetadata teamId={teamId} songId={songId} />
                  </div>
                </motion.div>
              )}
            </Suspense>
          </SongErrorBoundary>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SheetViewerSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <Music2 className="h-12 w-12 text-muted-foreground/50" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    </div>
  );
}
