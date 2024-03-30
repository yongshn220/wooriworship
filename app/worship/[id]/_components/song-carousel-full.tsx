'use client'

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import {useEffect, useState} from "react";
import {WorshipNote} from "@/app/worship/[id]/_components/worship-note";
import {worshipIndexAtom} from "@/app/worship/[id]/_states/menu";
import {useSetRecoilState} from "recoil";

const songList = [
  {
    title: "십자가",
    team: "J-US",
    urls: [
      "/test/music1-1.jpg",
      "/test/music1-2.jpg",
    ]
  },
  {
    title: "내 주를 가까이",
    team: "isaiah6tyone",
    urls: [
      "/test/music2.jpg",
    ]
  }
]

export function SongCarouselFull() {
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
            songList.map((song, index) => (
              <CarouselItem key={index} className="h-full">
                <Card className="h-full">
                  <CardContent className="flex flex-col w-full h-full divide-y">
                    <WorshipNote/>
                    <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-y-scroll lg:mx-10">
                      {
                        song.urls.map((url, index) => (
                          <div key={index} className="flex-center w-full h-full">
                            <img
                              alt="Music score"
                              src={url}
                              className="h-full object-contain rounded-md"
                            />
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
