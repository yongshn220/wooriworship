import * as React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {WorshipNote} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-note";
import {CarouselItem} from "@/components/ui/carousel";
import {WorshipLiveSheetInfo} from "@/app/worship/[teamId]/[worshipId]/live/_components/song-carousel-full";

interface Props {
  index: number
  sheetInfo: WorshipLiveSheetInfo
}

export function WorshipLiveCarouselItem({index, sheetInfo}: Props) {

  return (
    <CarouselItem key={`${index}-${Math.floor(Math.random() * 1000)}`} className="h-full">
      <Card className="h-full">
        <CardContent className="flex flex-col w-full h-full divide-y">
          <WorshipNote description={sheetInfo.note}/>
          <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-y-scroll lg:mx-10">
            {
              sheetInfo?.urls.map((url, index) => (
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
  )
}

