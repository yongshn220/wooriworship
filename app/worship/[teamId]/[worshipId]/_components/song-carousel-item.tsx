import {Card, CardContent} from "@/components/ui/card";
import {CarouselItem} from "@/components/ui/carousel";
import * as React from "react";
import {SongHeader} from "@/models/worship";
import Image from 'next/image'
import {songAtom} from "@/global-states/song-state";
import {useRecoilValue} from "recoil";

interface Props {
  musicSheetHeader: SongHeader
}
export function SongCarouselItem({musicSheetHeader}: Props) {
  const song = useRecoilValue(songAtom(songHeader?.id))

  if (!song) return <></>

  return (
    <CarouselItem >
      <div className="w-full py-2 text-md mb-2">{songHeader.note}</div>
      <Card>
        <CardContent className="flex flex-col w-full aspect-[4/5] max-h-[800px] divide-y">
          <div className="relative h-full flex flex-col bg-gray-50 overflow-y-scroll">
            {
              song.music_sheets.length > 0 ?
                song?.music_sheets.map((musicSheet, index) => (
                  <div key={index} className="flex-center w-full h-full">
                    <img
                      alt="Music score"
                      src={url}
                      className="h-full object-contain rounded-md"
                    />
                  </div>
                ))
              :
                <div className="w-full h-full flex-center flex-col">
                  <Image
                    alt="compose music image"
                    src="/illustration/noImage.svg"
                    width={300}
                    height={300}
                  />
                  <p className="w-full text-center mt-4 text-lg ">
                    No music sheet for &quot;<span className="font-semibold">{song.title}</span>&quot;
                  </p>
                </div>
            }
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  )
}
