import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { WorshipSongHeader } from "@/models/worship";
import { useRecoilValue } from "recoil";
import { musicSheetsByIdsAtom } from "@/global-states/music-sheet-state";
import { cn } from "@/lib/utils";
import { worshipViewPageModeAtom } from "../_states/worship-detail-states";
import { MusicSheetCounts } from "./worship-live-carousel";
import { useEffect, useMemo, useState } from "react";
import { MusicSheet } from "@/models/music_sheet";
import { DirectionType, WorshipViewPageMode } from "@/components/constants/enums";
import { worshipMultipleSheetsViewModeAtom } from "../_states/worship-detail-states";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


interface Props {
    songHeader: WorshipSongHeader
    setMusicSheetCounts: React.Dispatch<React.SetStateAction<Array<MusicSheetCounts>>>
}

export function WorshipLiveCarouselItemWrapper({ songHeader, setMusicSheetCounts }: Props) {
    const musicSheets = useRecoilValue(musicSheetsByIdsAtom(songHeader?.selected_music_sheet_ids))

    const multipleSheetsViewMode = useRecoilValue(worshipMultipleSheetsViewModeAtom)

    const modifiedMusicSheets = useMemo(() => {
        const results: Array<MusicSheet> = []

        if (multipleSheetsViewMode === DirectionType.VERTICAL) {
            // Group all URLs into a single 'sheet' entry so they render in one CarouselItem
            const allUrls: string[] = []
            musicSheets.forEach(sheet => {
                if (sheet?.urls) allUrls.push(...sheet.urls)
            })
            if (allUrls.length > 0 && musicSheets.length > 0) {
                // Create a virtual sheet with all compiled URLs
                results.push({ ...musicSheets[0], urls: allUrls })
            }
        } else {
            // Horizontal: Split every page into its own 'sheet' entry/CarouselItem
            musicSheets.forEach(musicSheet => {
                musicSheet?.urls.forEach(url => {
                    results.push({ ...musicSheet, urls: [url] })
                })
            })
        }
        return results

    }, [musicSheets, multipleSheetsViewMode])

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
    const [enablePan, setEnablePan] = useState(false)

    return (
        <CarouselItem className={cn("h-full p-0", { "basis-1/2": pageMode === WorshipViewPageMode.DOUBLE_PAGE })}>
            <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                wheel={{ disabled: true }}
                panning={{ disabled: !enablePan }}
                onTransformed={(e) => {
                    setEnablePan(e.state.scale > 1.01)
                }}
            >
                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                >
                    <div className="h-full w-full flex flex-col bg-background overflow-y-auto scrollbar-hide overscroll-contain">
                        {
                            urls.map((url, index) => (
                                <div
                                    key={index}
                                    className="relative flex-center w-full h-full p-1 select-none"
                                    style={{ WebkitTouchCallout: "none" }}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    <Image
                                        alt="Music score"
                                        src={url}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-contain shadow-sm select-none pointer-events-none"
                                    />
                                    {/* Shield to prevent detailed interaction/dragging of the image */}
                                    <div className="absolute inset-0 z-10" />
                                </div>
                            ))
                        }
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </CarouselItem>
    )
}
