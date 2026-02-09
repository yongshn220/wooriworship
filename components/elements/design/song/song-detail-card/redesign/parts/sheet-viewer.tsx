import { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { musicSheetAtom } from "@/global-states/music-sheet-state";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Music2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  teamId: string
  songId: string
  musicSheetId: string
  musicSheetIds?: string[]
  onMusicSheetChange?: (id: string) => void
  controlsVisible: boolean
  onInteraction: () => void
}

export function SheetViewer({
  teamId,
  songId,
  musicSheetId,
  musicSheetIds,
  onMusicSheetChange,
  controlsVisible,
  onInteraction
}: Props) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [scale, setScale] = useState(1);
  const transformRef = useRef<any>(null);
  const hasMultipleKeys = musicSheetIds && musicSheetIds.length > 1;

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      onInteraction();
    });
  }, [api, onInteraction]);

  const resetZoom = () => {
    transformRef.current?.resetTransform();
    setScale(1);
    onInteraction();
  };

  if (!musicSheet?.urls || musicSheet.urls.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Music2 className="h-16 w-16 opacity-50" />
        <p className="text-sm">No sheet available</p>
      </div>
    );
  }

  const isSinglePage = musicSheet.urls.length === 1;

  return (
    <div className="relative w-full h-full flex flex-col bg-muted/20">
      {/* Always visible: Key Selector */}
      <div className="absolute top-20 right-4 z-[110] pointer-events-auto">
        {hasMultipleKeys && onMusicSheetChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-11 px-4 rounded-full bg-background/95 backdrop-blur-xl border border-border/50 shadow-toss flex items-center gap-2 hover:bg-background active:scale-95 transition-all"
              >
                <Music2 className="h-4 w-4 text-muted-foreground" />
                <Suspense fallback={<span className="text-sm font-semibold">-</span>}>
                  <KeyLabel teamId={teamId} songId={songId} musicSheetId={musicSheetId} />
                </Suspense>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-[1200]">
              <Suspense fallback={<div className="p-2 text-sm text-muted-foreground">Loading...</div>}>
                {musicSheetIds?.map((id) => (
                  <KeyDropdownItem
                    key={id}
                    teamId={teamId}
                    songId={songId}
                    musicSheetId={id}
                    isSelected={id === musicSheetId}
                    onSelect={() => {
                      onMusicSheetChange(id);
                      onInteraction();
                    }}
                  />
                ))}
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-11 px-4 rounded-full bg-background/95 backdrop-blur-xl border border-border/50 shadow-toss flex items-center gap-2">
            <Music2 className="h-4 w-4 text-muted-foreground" />
            <Suspense fallback={<span className="text-sm font-semibold">-</span>}>
              <KeyLabel teamId={teamId} songId={songId} musicSheetId={musicSheetId} />
            </Suspense>
          </div>
        )}
      </div>

      {/* Auto-hiding Floating Controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[100] pointer-events-none"
          >

            {/* Bottom: Navigation Controls (multi-page only) */}
            {!isSinglePage && (
              <div className="absolute bottom-8 pb-safe-b left-0 right-0 flex justify-center pointer-events-auto">
                <div className="flex items-center gap-3 bg-background/95 backdrop-blur-xl border border-border/50 rounded-full px-4 py-2.5 shadow-toss-lg">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={() => {
                      api?.scrollPrev();
                      onInteraction();
                    }}
                    disabled={current === 1}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      current === 1
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-muted/80 active:scale-95"
                    )}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page Indicator */}
                  <div className="px-3 min-w-[80px] text-center">
                    <span className="text-sm font-bold tabular-nums">
                      {current} / {count}
                    </span>
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => {
                      api?.scrollNext();
                      onInteraction();
                    }}
                    disabled={current === count}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      current === count
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-muted/80 active:scale-95"
                    )}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Zoom indicator & reset (when zoomed) */}
            {scale > 1.05 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 pointer-events-auto"
              >
                <div className="flex items-center gap-2">
                  <div className="h-11 px-3 rounded-full bg-background/95 backdrop-blur-xl border border-border/50 shadow-toss flex items-center">
                    <span className="text-xs font-bold tabular-nums">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={resetZoom}
                    className="h-11 w-11 rounded-full bg-background/95 backdrop-blur-xl border border-border/50 shadow-toss flex items-center justify-center hover:bg-background active:scale-95 transition-all"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden pt-20">
        {isSinglePage ? (
          <div className="w-full h-full flex items-center justify-center">
            <SingleSheetItem
              url={musicSheet.urls[0]}
              onZoomChange={setScale}
              transformRef={transformRef}
              onInteraction={onInteraction}
            />
          </div>
        ) : (
          <Carousel
            setApi={setApi}
            className="w-full h-full"
            opts={{ watchDrag: scale <= 1.01 }}
          >
            <CarouselContent className="h-full">
              {musicSheet.urls.map((url: string, i: number) => (
                <CarouselItem key={i} className="h-full flex items-center justify-center">
                  <SingleSheetItem
                    url={url}
                    index={i}
                    onZoomChange={setScale}
                    transformRef={transformRef}
                    onInteraction={onInteraction}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </div>
  );
}

function SingleSheetItem({
  url,
  index = 0,
  onZoomChange,
  transformRef,
  onInteraction
}: {
  url: string;
  index?: number;
  onZoomChange?: (scale: number) => void;
  transformRef?: any;
  onInteraction?: () => void;
}) {
  const [enablePan, setEnablePan] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [url]);

  return (
    <TransformWrapper
      ref={transformRef}
      initialScale={1}
      minScale={1}
      maxScale={4}
      wheel={{ disabled: true }}
      doubleClick={{ mode: "toggle" }}
      panning={{ disabled: !enablePan }}
      onTransformed={(e) => {
        const zoomed = e.state.scale > 1.01;
        setEnablePan(zoomed);
        onZoomChange?.(e.state.scale);
        if (zoomed) onInteraction?.();
      }}
    >
      <TransformComponent
        wrapperClass="!w-full !h-full"
        contentClass="!flex !items-center !justify-center !w-full !h-full"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          )}
          {hasError ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Music2 className="h-12 w-12 opacity-50" />
              <p className="text-sm">Failed to load image</p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoaded(false);
                }}
                className="text-xs text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <Image
              src={url}
              alt={`Sheet ${index + 1}`}
              width={0}
              height={0}
              sizes="100vw"
              className={cn(
                "object-contain transition-opacity duration-300",
                !isLoaded && "opacity-0 absolute"
              )}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              priority={index === 0}
            />
          )}
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}

function KeyLabel({ teamId, songId, musicSheetId }: { teamId: string; songId: string; musicSheetId: string }) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }));
  return (
    <span className="text-sm font-bold text-foreground truncate max-w-[100px]">
      {musicSheet?.key || "Key"}
    </span>
  );
}

function KeyDropdownItem({
  teamId,
  songId,
  musicSheetId,
  isSelected,
  onSelect
}: {
  teamId: string;
  songId: string;
  musicSheetId: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }));
  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "cursor-pointer",
        isSelected && "bg-accent"
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <Music2 className="h-3.5 w-3.5 opacity-70" />
        <span className="font-medium">{musicSheet?.key || "Unknown"}</span>
        {musicSheet?.note && (
          <span className="text-muted-foreground text-xs ml-auto truncate">
            {musicSheet.note}
          </span>
        )}
      </div>
    </DropdownMenuItem>
  );
}
