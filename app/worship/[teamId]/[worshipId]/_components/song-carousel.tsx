'use client'

import * as React from "react"

import {Carousel, CarouselContent, type CarouselApi, CarouselPrevious, CarouselNext} from "@/components/ui/carousel"
import {useEffect} from "react";
import {SongCarouselItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel-item";
import {SongHeader} from "@/models/worship";

interface Props {
  songHeaderList: Array<SongHeader>
}

export function SongCarousel({songHeaderList}: Props) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(songHeaderList.length)

  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div id="song-carousel" className="w-full h-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent>
          {
            songHeaderList.map((header, index) => (
              <SongCarouselItem key={index} songHeader={header}/>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-4 text-center text-sm text-muted-foreground">
        Song {current} of {count}
      </div>
    </div>
  )
}
