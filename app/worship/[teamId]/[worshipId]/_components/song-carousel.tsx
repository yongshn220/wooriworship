'use client'

import * as React from "react"

import {Carousel, CarouselContent, type CarouselApi, CarouselPrevious, CarouselNext} from "@/components/ui/carousel"
import {useEffect, useMemo, useState} from "react";
import {SongCarouselItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel-item";
import {SongHeader, Worship} from "@/models/worship";
import {useRecoilValue} from "recoil";
import {songAtom, songsByWorshipIdAtom} from "@/global-states/song-state";
import {MusicSheetUrlWrapper} from "@/components/constants/types";

interface Props {
  worship: Worship
}

export function SongCarousel({worship}: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(worship?.songs?.length ?? 0)
  const beginningSong = useRecoilValue(songAtom(worship?.beginning_song?.id))
  const endingSong = useRecoilValue(songAtom(worship?.ending_song?.id))
  const mainSongs = useRecoilValue(songsByWorshipIdAtom(worship?.id))

  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const musicSheetUrlWrapperList = useMemo(() => {
    const results: MusicSheetUrlWrapper[] = []
    if (beginningSong) {
      const musicSheet = beginningSong?.music_sheets.find(ms => ms.key === worship?.beginning_song.key)
      const beginningSongHeader: MusicSheetUrlWrapper = {note: beginningSong?.description, urls: musicSheet?.urls}
      results.push(beginningSongHeader)
    }

    mainSongs?.map(song => {
      const s = useRecoilValue(songAtom(song.id))
      const header = worship?.songs?.find(header => header.id === song?.id)
      results.push({
        note: header?.note,
        urls: song?.music_sheets.
      })
    })
    if (endingSong) {
      const musicSheet = endingSong?.music_sheets.find(ms => ms.key === worship?.ending_song.key)
      const endingSongHeader: MusicSheetUrlWrapper = {note: endingSong?.description, urls: musicSheet?.urls}
      results.push(endingSongHeader)
    }
    return results
  }, [beginningSong, endingSong, worship?.beginning_song.key, worship?.ending_song.key, worship?.songs])


  return (
    <div id="song-carousel" className="w-full h-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent>
          {
            musicSheetUrlWrapperList.map((header, index) => (
              <SongCarouselItem key={index} musicSheetHeader={header}/>
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
