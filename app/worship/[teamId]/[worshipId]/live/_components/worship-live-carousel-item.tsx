import * as React from "react";
import {Card} from "@/components/ui/card";
import {WorshipNote} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-note";
import {CarouselItem} from "@/components/ui/carousel";
import {WorshipSongHeader} from "@/models/worship";
import {useRecoilValue} from "recoil";
import {musicSheetsByIdsAtom} from "@/global-states/music-sheet-state";
import {useEffect, useMemo} from "react";
import {worshipMultipleSheetsViewModeAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {DirectionType} from "@/components/constants/enums";
import {MusicSheet} from "@/models/music_sheet";
import {MusicSheetCounts} from "@/app/worship/[teamId]/[worshipId]/live/_components/worship-live-carousel";


interface Props {
  songHeader: WorshipSongHeader
  setMusicSheetCounts: React.Dispatch<React.SetStateAction<Array<MusicSheetCounts>>>
}

export function WorshipLiveCarouselItemWrapper({songHeader, setMusicSheetCounts}: Props) {
  const musicSheets = useRecoilValue(musicSheetsByIdsAtom(songHeader?.selected_music_sheet_ids))
  const multipleSheetsViewMode = useRecoilValue(worshipMultipleSheetsViewModeAtom)

  const modifiedMusicSheets = useMemo(() => {
    if (multipleSheetsViewMode === DirectionType.VERTICAL) {
      return musicSheets
    }

    const results: Array<MusicSheet> = []
    musicSheets.forEach(musicSheet => {
      musicSheet?.urls.forEach(url => {
        results.push({...musicSheet, urls: [url]})
      })
    })
    return results

  }, [multipleSheetsViewMode, musicSheets])

  useEffect(() => {
    setMusicSheetCounts((prev) => {
      const newCounts = prev.filter((count) => count.id !== songHeader?.id)
      return [...newCounts, {id: songHeader?.id, count: modifiedMusicSheets?.length}]
    })
  }, [modifiedMusicSheets?.length, setMusicSheetCounts, songHeader?.id])

  return (
    <React.Fragment>
      {
        modifiedMusicSheets?.map((musicSheet, index) => (
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

  return (
    <CarouselItem key={`${index}-${Math.floor(Math.random() * 1000)}`} className="h-full p-0">
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

