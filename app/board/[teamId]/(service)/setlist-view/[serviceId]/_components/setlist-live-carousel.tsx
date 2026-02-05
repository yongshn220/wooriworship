'use client'

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Carousel, type CarouselApi, CarouselContent, } from "@/components/ui/carousel"
import { useRecoilValue, useSetRecoilState } from "recoil";
import { setlistAtom } from "@/global-states/setlist-state";
import { SetlistSongHeader } from "@/models/setlist";
import { setlistIndexAtom, setlistIndexChangeEventAtom, setlistNoteAtom, setlistMultipleSheetsViewModeAtom } from "../_states/setlist-view-states";
import { annotationDrawingModeAtom } from "../_states/annotation-states";
import { SetlistLiveCarouselItemWrapper } from "./setlist-live-carousel-item";

interface Props {
    teamId: string
    serviceId: string
}

export interface MusicSheetCounts {
    id: string,
    count: number,
    note?: string
}

export function SetlistLiveCarousel({ teamId, serviceId }: Props) {
    const setlist = useRecoilValue(setlistAtom({ teamId, setlistId: serviceId }))
    const setSetlistIndex = useSetRecoilState(setlistIndexAtom)
    const setSetlistNote = useSetRecoilState(setlistNoteAtom)
    const setlistIndexChangeEvent = useRecoilValue(setlistIndexChangeEventAtom)
    const [musicSheetCounts, setMusicSheetCounts] = useState<Array<MusicSheetCounts>>([])
    const [api, setApi] = useState<CarouselApi>()
    const drawingMode = useRecoilValue(annotationDrawingModeAtom)
    const carouselOptions = useMemo(() => ({ align: "start" as const, watchDrag: !drawingMode }), [drawingMode])

    const aggregatedSongHeaders = useMemo(() => {
        const headers: Array<SetlistSongHeader> = []
        if (setlist?.beginning_song?.id) {
            headers.push(setlist?.beginning_song)
        }
        setlist?.songs?.forEach((songHeader) => {
            headers.push(songHeader)
        })
        if (setlist?.ending_song?.id) {
            headers.push(setlist?.ending_song)
        }
        return headers
    }, [setlist?.beginning_song, setlist?.ending_song, setlist?.songs])

    const sortedMusicSheetCounts = useMemo(() => {
        return aggregatedSongHeaders.map(header =>
            musicSheetCounts.find(c => c.id === header.id)
        ).filter((item): item is MusicSheetCounts => !!item)
    }, [aggregatedSongHeaders, musicSheetCounts])

    useEffect(() => {
        if (api) {
            api.scrollTo(setlistIndexChangeEvent);
        }
    }, [api, setlistIndexChangeEvent]);

    useEffect(() => {
        if (!api) return

        const handleSelect = () => {
            const currentIndex = api.selectedScrollSnap()
            setSetlistIndex((prev) => ({ ...prev, current: currentIndex }))

            let accumulatedCount = 0
            let foundNote = ""

            for (const item of sortedMusicSheetCounts) {
                if (currentIndex < accumulatedCount + item.count) {
                    foundNote = item.note || ""
                    break
                }
                accumulatedCount += item.count
            }
            setSetlistNote(foundNote)
        }

        api.on("select", handleSelect)
        handleSelect()

        return () => {
            api.off("select", handleSelect)
        }
    }, [sortedMusicSheetCounts, setSetlistIndex, setSetlistNote, api])

    const multipleSheetsViewMode = useRecoilValue(setlistMultipleSheetsViewModeAtom)

    useEffect(() => {
        setSetlistIndex((prev) => ({ ...prev, current: 0 }))
        if (api) {
            api.scrollTo(0, true)
        }
    }, [multipleSheetsViewMode, setSetlistIndex, api])

    useEffect(() => {
        let totalCounts = 0
        sortedMusicSheetCounts.forEach((count) => {
            totalCounts += count?.count
        })
        setSetlistIndex((prev) => ({ ...prev, total: totalCounts }))
    }, [sortedMusicSheetCounts, setSetlistIndex]);

    return (
        <div id="song-carousel" className="w-full h-full">
            <Carousel opts={carouselOptions} setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full">
                    {
                        (() => {
                            let cumulativeIndex = 0
                            return aggregatedSongHeaders?.map((songHeader, index) => {
                                const startIndex = cumulativeIndex
                                const countEntry = sortedMusicSheetCounts.find(c => c.id === songHeader.id)
                                cumulativeIndex += countEntry?.count || 0
                                return (
                                    <SetlistLiveCarouselItemWrapper key={index} teamId={teamId} songHeader={songHeader} setMusicSheetCounts={setMusicSheetCounts} globalStartIndex={startIndex} />
                                )
                            })
                        })()
                    }
                </CarouselContent>
            </Carousel>
        </div>
    )
}
