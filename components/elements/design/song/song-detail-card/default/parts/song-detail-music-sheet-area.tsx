import React, { useEffect, useState } from "react";
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
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          doubleClick={{ mode: "reset" }}
          wheel={{ step: 0.1 }}
          panning={{ disabled: false }}
        >
          <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
            <Image
              src={musicSheet.urls[0]}
              alt="Sheet 1"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto max-h-[calc(100vh-80px)] object-contain shadow-sm"
              style={{ width: "100%", height: "auto" }}
            />
          </TransformComponent>
        </TransformWrapper>
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
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                doubleClick={{ mode: "reset" }}
                wheel={{ step: 0.1 }}
                panning={{ disabled: false }}
                onTransformed={(_, state) => {
                  setIsZoomed(state.scale > 1)
                }}
              >
                <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
                  <Image
                    src={url}
                    alt={`Sheet ${i + 1}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto max-h-[calc(100vh-80px)] object-contain shadow-sm"
                    style={{ width: "100%", height: "auto" }}
                  />
                </TransformComponent>
              </TransformWrapper>
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
