'use client'

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Carousel, type CarouselApi, CarouselContent, } from "@/components/ui/carousel"
import { useRecoilValue, useSetRecoilState } from "recoil";
import { setlistAtom } from "@/global-states/setlist-state";
import { SetlistSongHeader } from "@/models/setlist";
import { setlistIndexAtom, setlistIndexChangeEventAtom, setlistNoteAtom, setlistMultipleSheetsViewModeAtom, setlistFlatPagesSelector } from "../_states/setlist-view-states";
import { annotationDrawingModeAtom } from "../_states/annotation-states";
import { SetlistLiveCarouselItem } from "./setlist-live-carousel-item";

interface Props {
    teamId: string
    serviceId: string
    initialPage: number
}

export function SetlistLiveCarousel({ teamId, serviceId, initialPage }: Props) {
    const setlist = useRecoilValue(setlistAtom({ teamId, setlistId: serviceId }))
    const setSetlistIndex = useSetRecoilState(setlistIndexAtom)
    const setSetlistNote = useSetRecoilState(setlistNoteAtom)
    const setlistIndexChangeEvent = useRecoilValue(setlistIndexChangeEventAtom)
    const flatPages = useRecoilValue(setlistFlatPagesSelector({ teamId, serviceId }))
    const [api, setApi] = useState<CarouselApi>()
    const drawingMode = useRecoilValue(annotationDrawingModeAtom)
    const [startIndex] = useState(initialPage)
    const carouselOptions = useMemo(() => ({ align: "start" as const, watchDrag: !drawingMode, startIndex }), [drawingMode, startIndex])

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

    const initialTimestampRef = React.useRef(setlistIndexChangeEvent.timestamp)

    useEffect(() => {
        if (api && setlistIndexChangeEvent.timestamp !== initialTimestampRef.current) {
            api.scrollTo(setlistIndexChangeEvent.page);
        }
    }, [api, setlistIndexChangeEvent]);

    useEffect(() => {
        if (!api) return

        const handleSelect = () => {
            const currentIndex = api.selectedScrollSnap()
            setSetlistIndex((prev) => ({ ...prev, current: currentIndex }))

            // Find note for current page using flatPages and aggregatedSongHeaders
            const currentPage = flatPages[currentIndex]
            if (currentPage) {
                const songHeader = aggregatedSongHeaders.find(h => h.id === currentPage.songId)
                setSetlistNote(songHeader?.note || "")
            }
        }

        api.on("select", handleSelect)
        handleSelect()

        return () => {
            api.off("select", handleSelect)
        }
    }, [flatPages, aggregatedSongHeaders, setSetlistIndex, setSetlistNote, api])

    const multipleSheetsViewMode = useRecoilValue(setlistMultipleSheetsViewModeAtom)

    const prevViewModeRef = React.useRef(multipleSheetsViewMode)

    useEffect(() => {
        // Only reset when view mode actually changes, not on initial mount or api init
        if (prevViewModeRef.current === multipleSheetsViewMode) return
        prevViewModeRef.current = multipleSheetsViewMode

        setSetlistIndex((prev) => ({ ...prev, current: 0 }))
        if (api) {
            api.scrollTo(0, true)
        }
    }, [multipleSheetsViewMode, setSetlistIndex, api])

    useEffect(() => {
        setSetlistIndex((prev) => ({ ...prev, total: flatPages.length }))
    }, [flatPages.length, setSetlistIndex])

    return (
        <div id="song-carousel" className="w-full h-full">
            <Carousel opts={carouselOptions} setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full">
                    {flatPages.map((page) => (
                        <SetlistLiveCarouselItem
                            key={page.globalIndex}
                            globalIndex={page.globalIndex}
                            urls={[page.url]}
                            teamId={page.teamId}
                            songId={page.songId}
                            sheetId={page.sheetId}
                            pageIndex={page.pageIndex}
                        />
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
