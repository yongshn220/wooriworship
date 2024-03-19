'use client'

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import Image from 'next/image'

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
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div id="song-carousel" className="w-full h-full">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent className="h-full">
          {
            songList.map((song, index) => (
              <CarouselItem key={index} className="h-full">
                <Card className="h-full">
                  <CardContent className="flex flex-col w-full h-full divide-y">
                    <div className="w-full p-2 px-4 text-sm">인트로 A E F#m E  이후 어쩌구 저쩌구 후렴 4번 반복 첫번째 후렴 목소리로 이후 나머지 빌드업 어쩌구 인트로 A E F#m E  이후 어쩌구 저쩌구 후렴 4번 반복 첫번째 후렴 목소리로 이후 나머지 빌드업</div>
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
        {/*<CarouselPrevious />*/}
        {/*<CarouselNext />*/}
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Song {current} of {count}
      </div>
    </div>
  )
}
