'use client'

import * as React from "react"

import {Carousel, CarouselContent, type CarouselApi, CarouselPrevious, CarouselNext} from "@/components/ui/carousel"
import {useEffect, useMemo, useState} from "react";
import {
  SongCarouselItem,
  SongCarouselItemWrapper
} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel-item";
import {WorshipSongHeader, Worship} from "@/models/worship";
import {useRecoilValue} from "recoil";
import {songAtom, songsByWorshipIdAtom} from "@/global-states/song-state";
import {MusicSheetUrlWrapper} from "@/components/constants/types";
import {musicSheetsByIdsAtom} from "@/global-states/music-sheet-state";
import {MusicSheet} from "@/models/music_sheet";

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
  // const beginningSongSelectedMusicSheets = useRecoilValue(musicSheetsByIdsAtom(worship?.beginning_song?.selected_music_sheet_ids))
  // const endingSongSelectedMusicSheets = useRecoilValue(musicSheetsByIdsAtom(worship?.ending_song?.selected_music_sheet_ids))

  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const aggregatedSongHeaders = useMemo(() => {
    const headers: Array<WorshipSongHeader> = []
    if (beginningSong) {
      headers.push(worship?.beginning_song)
    }
    worship?.songs?.forEach((songHeader) => {
      headers.push(songHeader)
    })
   if (endingSong) {
      headers.push(worship?.ending_song)
    }
    return headers
  }, [beginningSong, endingSong, worship?.beginning_song, worship?.ending_song, worship?.songs])


  return (
    <div id="song-carousel" className="w-full h-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent>
          {
            aggregatedSongHeaders.map((songHeader, index) => (
              <SongCarouselItemWrapper key={index} songHeader={songHeader}/>
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
