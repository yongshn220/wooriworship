import * as React from "react";
import { Card } from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { WorshipSongHeader } from "@/models/worship";
import { useRecoilValue } from "recoil";
import { musicSheetsByIdsAtom } from "@/global-states/music-sheet-state";
import { cn } from "@/lib/utils";
import { worshipViewPageModeAtom } from "../_states/worship-detail-states";
import { WorshipViewPageMode } from "@/components/constants/enums";
import { MusicSheetCounts } from "./worship-live-carousel";
import { useEffect, useMemo } from "react";
import { MusicSheet } from "@/models/music_sheet";


interface Props {
    songHeader: WorshipSongHeader
    setMusicSheetCounts: React.Dispatch<React.SetStateAction<Array<MusicSheetCounts>>>
}

export function WorshipLiveCarouselItemWrapper({ songHeader, setMusicSheetCounts }: Props) {
    const musicSheets = useRecoilValue(musicSheetsByIdsAtom(songHeader?.selected_music_sheet_ids))

    const modifiedMusicSheets = useMemo(() => {
        const results: Array<MusicSheet> = []
        musicSheets.forEach(musicSheet => {
            musicSheet?.urls.forEach(url => {
                results.push({ ...musicSheet, urls: [url] })
            })
        })
        return results

    }, [musicSheets])

    useEffect(() => {
        setMusicSheetCounts((prev) => {
            const newCounts = prev.filter((count) => count.id !== songHeader?.id)
            return [...newCounts, { id: songHeader?.id, count: modifiedMusicSheets?.length, note: songHeader?.note }]
        })
    }, [modifiedMusicSheets?.length, setMusicSheetCounts, songHeader?.id, songHeader?.note])


    return (
        <React.Fragment>
            {
                modifiedMusicSheets?.map((musicSheet, index) => (
                    <WorshipLiveCarouselItem key={index} index={index} urls={musicSheet?.urls} />
                ))
            }
        </React.Fragment>
    )
}



interface WorshipLiveCarouselItemProps {
    index: number
    urls: Array<string>
}

export function WorshipLiveCarouselItem({ index, urls }: WorshipLiveCarouselItemProps) {
    const pageMode = useRecoilValue(worshipViewPageModeAtom)

    return (
        <CarouselItem className={cn("h-full p-0", { "basis-1/2": pageMode === WorshipViewPageMode.DOUBLE_PAGE })}>
            <div className="h-full w-full flex flex-col bg-white dark:bg-black overflow-y-auto scrollbar-hide">
                {
                    urls.map((url, index) => (
                        <div
                            key={index}
                            className="relative flex-center w-full h-full p-1 select-none"
                            style={{ WebkitTouchCallout: "none" }}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                        >
                            <img
                                alt="Music score"
                                src={url}
                                className="max-w-full max-h-full object-contain shadow-sm select-none pointer-events-none"
                            />
                            {/* Shield to prevent detailed interaction/dragging of the image */}
                            <div className="absolute inset-0 z-10" />
                        </div>
                    ))
                }
            </div>
        </CarouselItem>
    )
}
