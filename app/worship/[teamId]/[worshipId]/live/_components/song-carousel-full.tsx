'use client'

import * as React from "react"
import {useEffect, useMemo, useState} from "react"
import {Carousel, type CarouselApi, CarouselContent,} from "@/components/ui/carousel"
import {worshipIndexAtom, worshipIndexChangeEventAtom, worshipMultipleSheetsViewModeAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {WorshipLiveCarouselItem} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-live-carousel-item";
import {songsByWorshipIdAtom} from "@/global-states/song-state";
import {DirectionType} from "@/components/constants/enums";

interface Props {
  worshipId: string
}

export interface WorshipLiveSheetInfo {
  note: string
  urls: string[]
}

export function SongCarouselFull({worshipId}: Props) {
  const worship = useRecoilValue(worshipAtom(worshipId))
  const songs = useRecoilValue(songsByWorshipIdAtom(worshipId))
  const setIndex = useSetRecoilState(worshipIndexAtom)
  const worshipIndexChangeEvent = useRecoilValue(worshipIndexChangeEventAtom)
  const multipleSheetsViewMode = useRecoilValue(worshipMultipleSheetsViewModeAtom)
  const [api, setApi] = useState<CarouselApi>()

  const sheetInfoList = useMemo(() => {
    const processedSheetInfo: Array<WorshipLiveSheetInfo> = []
    if (multipleSheetsViewMode === DirectionType.VERTICAL) {
      songs.forEach((song) => {
        const header = worship?.songs?.find(header => header.id === song?.id)
        processedSheetInfo.push({note: header?.note, urls: song?.music_sheet_urls})
      })
    }
    else {
      songs.forEach((song) => {
        const header = worship?.songs?.find(header => header.id === song?.id)
        song?.music_sheet_urls?.forEach((url) => {
          processedSheetInfo.push({note: header.note, urls: [url]})
        })
      })
    }
    return processedSheetInfo
  }, [multipleSheetsViewMode, songs, worship?.songs])


  useEffect(() => {
    if (api) {
      api.scrollTo(worshipIndexChangeEvent);
      console.log("API Called")
    }
  }, [api, worshipIndexChangeEvent]);

  useEffect(() => {
    if (!api) return

    setIndex({
      total: sheetInfoList.length,
      current: api.selectedScrollSnap()
    })

    api.on("select", () => {
      setIndex((prev) => ({...prev, current: api.selectedScrollSnap()}))
    })
  }, [sheetInfoList.length, setIndex, api, multipleSheetsViewMode])


  return (
    <div id="song-carousel" className="w-full h-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent className="h-full">
          {
            sheetInfoList?.map((sheetInfo, index) => (
              <WorshipLiveCarouselItem key={index} index={index} sheetInfo={sheetInfo}/>
            ))
          }
        </CarouselContent>
      </Carousel>
    </div>
  )
}
