import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { musicSheetAtom } from "@/global-states/music-sheet-state";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Props {
  teamId: string
  songId: string
  musicSheetId: string
  musicSheetIds?: string[]
  onMusicSheetChange?: (id: string) => void
}

export function SongDetailMusicSheetArea({ teamId, songId, musicSheetId, musicSheetIds, onMusicSheetChange }: Props) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }))
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const hasMultipleKeys = musicSheetIds && musicSheetIds.length > 1

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (!musicSheet?.urls || musicSheet.urls.length === 0) {
    return (
      <div className="w-full h-64 flex-center text-muted-foreground">
        No sheet available
      </div>
    )
  }

  // Single Page Case
  if (musicSheet.urls.length === 1) {
    return (
      <div className="w-full flex-1 flex flex-col items-center gap-3 py-2 pb-12">
        {/* Key Display/Selector - Right Aligned */}
        <div className="w-full flex items-center justify-end px-4 shrink-0 relative z-30">
          {onMusicSheetChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="h-10 px-4 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center gap-2 hover:bg-background active:scale-95 transition-all">
                  <Suspense fallback={<span className="text-sm font-semibold">-</span>}>
                    <KeyLabel teamId={teamId} songId={songId} musicSheetId={musicSheetId} />
                  </Suspense>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-[50vh] overflow-y-auto z-[1200] bg-white">
                <Suspense fallback={<div className="p-2 text-sm text-muted-foreground">Loading keys...</div>}>
                  {musicSheetIds?.map((id) => (
                    <KeyDropdownItem
                      key={id}
                      teamId={teamId}
                      songId={songId}
                      musicSheetId={id}
                      isSelected={id === musicSheetId}
                      onSelect={() => onMusicSheetChange(id)}
                    />
                  ))}
                </Suspense>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-10 px-4 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center">
              <Suspense fallback={<span className="text-sm font-semibold">-</span>}>
                <KeyLabel teamId={teamId} songId={songId} musicSheetId={musicSheetId} />
              </Suspense>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0">
          <SingleSheetItem url={musicSheet.urls[0]} />
        </div>
      </div>
    )
  }

  // Multi Page Carousel Case
  return (
    <div className="w-full flex-1 flex flex-col items-center gap-3 py-2 pb-12">
      {/* Unified Navigation Bar */}
      <div className="w-full flex items-center justify-between px-4 shrink-0 relative z-30">
        {/* Left Spacer */}
        <div className="flex-1" />

        {/* Center: Page Navigation */}
        <div className="flex items-center gap-2">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={current === 1}
            className={cn(
              "min-h-touch min-w-touch h-10 w-10 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center transition-all",
              current === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-background active:scale-95"
            )}
            aria-label="Previous sheet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Page Indicator */}
          <div className="h-10 px-4 bg-background/90 backdrop-blur-md border border-border rounded-full shadow-lg flex items-center">
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              {current} / {count}
            </span>
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={current === count}
            className={cn(
              "min-h-touch min-w-touch h-10 w-10 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center transition-all",
              current === count ? "opacity-40 cursor-not-allowed" : "hover:bg-background active:scale-95"
            )}
            aria-label="Next sheet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Right: Key Display/Selector */}
        <div className="flex-1 flex justify-end">
          {onMusicSheetChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="h-10 px-4 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center gap-2 hover:bg-background active:scale-95 transition-all">
                  <Suspense fallback={<span className="text-sm font-semibold">-</span>}>
                    <KeyLabel teamId={teamId} songId={songId} musicSheetId={musicSheetId} />
                  </Suspense>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-[50vh] overflow-y-auto z-[1200] bg-white">
                <Suspense fallback={<div className="p-2 text-sm text-muted-foreground">Loading keys...</div>}>
                  {musicSheetIds?.map((id) => (
                    <KeyDropdownItem
                      key={id}
                      teamId={teamId}
                      songId={songId}
                      musicSheetId={id}
                      isSelected={id === musicSheetId}
                      onSelect={() => onMusicSheetChange(id)}
                    />
                  ))}
                </Suspense>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="h-10 px-4 rounded-full bg-background/90 backdrop-blur-md border border-border shadow-lg flex items-center">
              <Suspense fallback={<span className="text-sm font-semibold">-</span>}>
                <KeyLabel teamId={teamId} songId={songId} musicSheetId={musicSheetId} />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Music Sheet Carousel */}
      <Carousel setApi={setApi} className="w-full max-w-full flex-1 min-h-0" opts={{ watchDrag: !isZoomed }}>
        <CarouselContent>
          {musicSheet.urls.map((url: string, i: number) => (
            <CarouselItem key={i} className="flex justify-center items-center">
              <SingleSheetItem
                url={url}
                index={i}
                onZoomChange={(zoomed) => setIsZoomed(zoomed)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

function SingleSheetItem({ url, index = 0, onZoomChange }: { url: string; index?: number; onZoomChange?: (zoomed: boolean) => void }) {
  const [enablePan, setEnablePan] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(false)
  }, [url])

  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={4}
      wheel={{ disabled: true }}
      doubleClick={{ mode: "toggle" }}
      panning={{ disabled: !enablePan }}
      onTransformed={(e) => {
        const zoomed = e.state.scale > 1.01
        setEnablePan(zoomed)
        onZoomChange?.(zoomed)
      }}
    >
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
        <div className="relative w-full h-full">
          {!isLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          )}
          <Image
            src={url}
            alt={`Sheet ${index + 1}`}
            width={0}
            height={0}
            sizes="100vw"
            className={cn(
              "max-w-full max-h-full w-auto h-auto shadow-sm object-contain",
              !isLoaded && "opacity-0 absolute inset-0"
            )}
            style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}

function KeyLabel({ teamId, songId, musicSheetId }: { teamId: string; songId: string; musicSheetId: string }) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }));
  return (
    <span className="text-sm font-semibold text-foreground truncate max-w-[120px]">
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
      <span className="font-medium">{musicSheet?.key || "Unknown Key"}</span>
      {musicSheet?.note && <span className="text-muted-foreground text-xs ml-2 truncate">{musicSheet.note}</span>}
    </DropdownMenuItem>
  );
}
