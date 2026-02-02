import { useEffect, useState } from "react";
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

interface Props {
  teamId: string
  songId: string
  musicSheetId: string
}

export function SongDetailMusicSheetArea({ teamId, songId, musicSheetId }: Props) {
  const musicSheet = useRecoilValue(musicSheetAtom({ teamId, songId, sheetId: musicSheetId }))
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

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
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-2 pb-12">
        <SingleSheetItem url={musicSheet.urls[0]} />
      </div>
    )
  }

  // Multi Page Carousel Case
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-2 pb-12">
      <Carousel setApi={setApi} className="w-full max-w-full" opts={{ watchDrag: !isZoomed }}>
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

        {/* Arrow Navigation */}
        <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm" />
        <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm" />
      </Carousel>

      {/* Page Indicator */}
      <div className="text-xs font-medium bg-foreground/60 text-background px-2 py-1 rounded-full">
        {current} / {count}
      </div>
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
      <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
        <div className="relative w-full">
          {!isLoaded && (
            <div className="w-full aspect-[3/4] flex items-center justify-center">
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
              "w-full h-auto max-h-[calc(100vh-80px)] object-contain shadow-sm",
              !isLoaded && "opacity-0 absolute inset-0"
            )}
            style={{ width: "100%", height: "auto" }}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}
