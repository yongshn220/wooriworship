import React, { useEffect, useState } from "react";
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

interface Props {
  musicSheetId: string
}

export function SongDetailMusicSheetArea({ musicSheetId }: Props) {
  const musicSheet = useRecoilValue(musicSheetAtom(musicSheetId))
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

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
      <div className="w-full h-64 flex-center text-gray-400">
        No sheet available
      </div>
    )
  }

  // Single Page Case
  if (musicSheet.urls.length === 1) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-2 pb-12">
        <div className="relative w-full flex justify-center items-center">
          <img
            src={musicSheet.urls[0]}
            alt="Sheet 1"
            className="w-full h-auto max-h-[calc(100vh-80px)] object-contain shadow-sm"
            loading="lazy"
          />
        </div>
      </div>
    )
  }

  // Multi Page Carousel Case
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-2 pb-12">
      <Carousel setApi={setApi} className="w-full max-w-full">
        <CarouselContent>
          {musicSheet.urls.map((url: string, i: number) => (
            <CarouselItem key={i} className="flex justify-center items-center">
              <div className="relative w-full flex justify-center items-center">
                <img
                  src={url}
                  alt={`Sheet ${i + 1}`}
                  className="w-full h-auto max-h-[calc(100vh-80px)] object-contain shadow-sm"
                  loading="lazy"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrow Navigation */}
        <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-sm" />
        <CarouselNext className="right-2 bg-white/80 backdrop-blur-sm" />
      </Carousel>

      {/* Page Indicator */}
      <div className="text-xs font-medium bg-black/50 text-white px-2 py-1 rounded-full">
        {current} / {count}
      </div>
    </div>
  )
}
