import * as React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {WorshipNote} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-note";
import {CarouselItem} from "@/components/ui/carousel";
import {SongHeader} from "@/models/worship";
import {songAtom} from "@/global-states/song-state";
import {useRecoilValue} from "recoil";

interface Props {
  index: number
  songHeader: SongHeader
}

export function SongCarouselFullItem({index, songHeader}: Props) {
  const song = useRecoilValue(songAtom(songHeader?.id))

  return (
    <CarouselItem key={index} className="h-full">
      <Card className="h-full">
        <CardContent className="flex flex-col w-full h-full divide-y">
          <WorshipNote description={songHeader.note}/>
          <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-y-scroll lg:mx-10">
            {
              song?.music_sheet_urls.map((url, index) => (
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
          {/*<div className="relative flex-1 h-full bg-gray-50 overflow-y-scroll lg:mx-10 grid grid-cols-1">*/}
          {/*    {*/}
          {/*      song.music_sheet_urls.map((url, index) => (*/}
          {/*        <div key={index} className="relative flex-center w-full h-full bg-red-500 border">*/}
          {/*          <Image*/}
          {/*            alt="Music score"*/}
          {/*            src={url}*/}
          {/*            fill*/}
          {/*            className="h-full object-contain"*/}
          {/*          />*/}
          {/*        </div>*/}
          {/*      ))*/}
          {/*    }*/}
          {/*</div>*/}
        </CardContent>
      </Card>
    </CarouselItem>
  )
}
