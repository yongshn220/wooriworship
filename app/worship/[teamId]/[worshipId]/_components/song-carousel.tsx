'use client'

import * as React from "react"

import {Carousel, CarouselContent, type CarouselApi, CarouselPrevious, CarouselNext} from "@/components/ui/carousel"
import {useEffect, useMemo, useState} from "react";
import {SongCarouselItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel-item";
import {SongHeader, Worship} from "@/models/worship";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";

interface Props {
  worship: Worship
}

export function SongCarousel({worship}: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(worship?.songs?.length ?? 0)
  const beginningSong = useRecoilValue(songAtom(worship?.beginning_song_id))
  const endingSong = useRecoilValue(songAtom(worship?.ending_song_id))

  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const songHeaderList = useMemo(() => {
    const results = []
    if (beginningSong) {
      const beginningSongHeader: SongHeader = {note: beginningSong?.description, id: beginningSong?.id}
      results.push(beginningSongHeader)
    }

    worship?.songs.forEach(songHeader => {
      results.push(songHeader)
    })

    if (endingSong) {
      const endingSongHeader: SongHeader = {note: endingSong?.description, id: endingSong?.id}
      results.push(endingSongHeader)
    }
    return results
  }, [beginningSong, endingSong, worship?.songs])


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
