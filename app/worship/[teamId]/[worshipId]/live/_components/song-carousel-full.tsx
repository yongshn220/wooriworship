'use client'

import * as React from "react"

import {Carousel, CarouselContent, CarouselItem, type CarouselApi,} from "@/components/ui/carousel"
import {useEffect, useState} from "react";
import {worshipIndexAtom, worshipIndexChangeEventAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {SongCarouselFullItem} from "@/app/worship/[teamId]/[worshipId]/live/_components/song-carousel-full-item";

interface Props {
  worshipId: string
}

export function SongCarouselFull({worshipId}: Props) {
  const worship = useRecoilValue(worshipAtom(worshipId))
  const [api, setApi] = useState<CarouselApi>()
  const setIndex = useSetRecoilState(worshipIndexAtom)
  const worshipIndexChangeEvent = useRecoilValue(worshipIndexChangeEventAtom)

  useEffect(() => {
    if (api) {
      api.scrollTo(worshipIndexChangeEvent);
    }
  }, [api, worshipIndexChangeEvent]);

  useEffect(() => {
    if (!api) return

    setIndex({
      total: api.scrollSnapList().length,
      current: api.selectedScrollSnap()
    })

    api.on("select", () => {
      setIndex((prev) => ({...prev, current: api.selectedScrollSnap()}))
    })
  }, [setIndex, api])


  return (
    <div id="song-carousel" className="w-full h-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent className="h-full">
          {
            worship?.songs.map((songHeader, index) => (
              <SongCarouselFullItem key={index} index={index} songHeader={songHeader}/>
            ))
          }
        </CarouselContent>
      </Carousel>
    </div>
  )
}
