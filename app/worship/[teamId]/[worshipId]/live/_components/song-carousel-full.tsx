'use client'

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {Carousel, CarouselContent, CarouselItem, type CarouselApi,} from "@/components/ui/carousel"
import {useEffect, useState} from "react";
import {WorshipNote} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-note";
import {worshipIndexAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {worshipAtom, worshipSongListAtom} from "@/global-states/worship-state";
import Image from "next/image"
import {SongCarouselFullItem} from "@/app/worship/[teamId]/[worshipId]/live/_components/song-carousel-full-item";

interface Props {
  worshipId: string
}

export function SongCarouselFull({worshipId}: Props) {
  const worship = useRecoilValue(worshipAtom(worshipId))
  const [api, setApi] = useState<CarouselApi>()
  const setIndex = useSetRecoilState(worshipIndexAtom)

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
