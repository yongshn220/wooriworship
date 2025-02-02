import * as React from "react";
import {Card} from "@/components/ui/card";
import {CarouselItem} from "@/components/ui/carousel";
import {WorshipSongHeader} from "@/models/worship";
import {useRecoilValue} from "recoil";
import {musicSheetsByIdsAtom} from "@/global-states/music-sheet-state";
import {WorshipNote} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/worship-view/_components/worship-note";
import { cn } from "@/lib/utils";
import { worshipViewPageModeAtom } from "../../_states/worship-detail-states";
import { WorshipViewPageMode } from "@/components/constants/enums";
import { MusicSheetCounts } from "./worship-live-carousel";
import { useEffect } from "react";


interface Props {
  songHeader: WorshipSongHeader
  setMusicSheetCounts: React.Dispatch<React.SetStateAction<Array<MusicSheetCounts>>>
}

export function WorshipLiveCarouselItemWrapper({songHeader, setMusicSheetCounts}: Props) {
  const musicSheets = useRecoilValue(musicSheetsByIdsAtom(songHeader?.selected_music_sheet_ids))
  
  useEffect(() => {
    setMusicSheetCounts((prev) => {
      const newCounts = prev.filter((count) => count.id !== songHeader?.id)
      return [...newCounts, {id: songHeader?.id, count: musicSheets?.length}]
    })
  }, [musicSheets?.length, setMusicSheetCounts, songHeader?.id])


  return (
    <React.Fragment>
      {
        musicSheets?.map((musicSheet, index) => (
          <WorshipLiveCarouselItem key={index} index={index} note={songHeader?.note} urls={musicSheet?.urls} />
        ))
      }
    </React.Fragment>
  )
}



interface WorshipLiveCarouselItemProps {
  index: number
  note: string
  urls: Array<string>
}

export function WorshipLiveCarouselItem({index, note, urls}: WorshipLiveCarouselItemProps) {
  const pageMode = useRecoilValue(worshipViewPageModeAtom)
  
  return (
    <CarouselItem key={`${index}-${Math.floor(Math.random() * 1000)}`} className={cn("h-full p-0", {"basis-1/2": pageMode === WorshipViewPageMode.DOUBLE_PAGE})}>
      <Card className="h-full pl-4">
        <div className="flex-center flex-col w-full h-full divide-y ">
          <WorshipNote description={note}/>
          <div className="flex-1 w-full h-full flex flex-col bg-gray-50 overflow-y-scroll scrollbar-hide">
            {
              urls.map((url, index) => (
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
        </div>
      </Card>
    </CarouselItem>
  )
}

