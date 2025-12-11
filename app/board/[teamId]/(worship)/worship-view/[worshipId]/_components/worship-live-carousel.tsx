'use client'

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Carousel, type CarouselApi, CarouselContent, } from "@/components/ui/carousel"
import { useRecoilValue, useSetRecoilState } from "recoil";
import { worshipAtom } from "@/global-states/worship-state";
import { WorshipSongHeader } from "@/models/worship";
import { worshipIndexAtom, worshipIndexChangeEventAtom, worshipNoteAtom } from "../_states/worship-detail-states";
import { WorshipLiveCarouselItemWrapper } from "./worship-live-carousel-item";

interface Props {
    worshipId: string
}

export interface MusicSheetCounts {
    id: string,
    count: number,
    note?: string
}

export function WorshipLiveCarousel({ worshipId }: Props) {
    const worship = useRecoilValue(worshipAtom(worshipId))
    const setWorshipIndex = useSetRecoilState(worshipIndexAtom)
    const setWorshipNote = useSetRecoilState(worshipNoteAtom)
    const worshipIndexChangeEvent = useRecoilValue(worshipIndexChangeEventAtom)
    const [musicSheetCounts, setMusicSheetCounts] = useState<Array<MusicSheetCounts>>([])
    const [api, setApi] = useState<CarouselApi>()
    const carouselOptions = useMemo(() => ({ align: "start" } as const), [])

    const aggregatedSongHeaders = useMemo(() => {
        const headers: Array<WorshipSongHeader> = []
        if (worship?.beginning_song?.id) {
            headers.push(worship?.beginning_song)
        }
        worship?.songs?.forEach((songHeader) => {
            headers.push(songHeader)
        })
        if (worship?.ending_song?.id) {
            headers.push(worship?.ending_song)
        }
        return headers
    }, [worship?.beginning_song, worship?.ending_song, worship?.songs])

    const sortedMusicSheetCounts = useMemo(() => {
        return aggregatedSongHeaders.map(header =>
            musicSheetCounts.find(c => c.id === header.id)
        ).filter((item): item is MusicSheetCounts => !!item)
    }, [aggregatedSongHeaders, musicSheetCounts])

    useEffect(() => {
        if (api) {
            api.scrollTo(worshipIndexChangeEvent);
        }
    }, [api, worshipIndexChangeEvent]);

    // Calculate current note based on index
    useEffect(() => {
        if (!api) return

        const handleSelect = () => {
            const currentIndex = api.selectedScrollSnap()
            setWorshipIndex((prev) => ({ ...prev, current: currentIndex }))

            let accumulatedCount = 0
            let foundNote = ""

            for (const item of sortedMusicSheetCounts) {
                if (currentIndex < accumulatedCount + item.count) {
                    foundNote = item.note || ""
                    break
                }
                accumulatedCount += item.count
            }
            setWorshipNote(foundNote)
        }

        api.on("select", handleSelect)
        // Initial set
        handleSelect()

        return () => {
            api.off("select", handleSelect)
        }
    }, [sortedMusicSheetCounts, setWorshipIndex, setWorshipNote, api])

    useEffect(() => {
        let totalCounts = 0
        sortedMusicSheetCounts.forEach((count) => {
            totalCounts += count?.count
        })
        setWorshipIndex((prev) => ({ ...prev, total: totalCounts }))
    }, [sortedMusicSheetCounts, setWorshipIndex]);

    return (
        <div id="song-carousel" className="w-full h-full">
            <Carousel opts={carouselOptions} setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full">
                    {
                        aggregatedSongHeaders?.map((songHeader, index) => (
                            <WorshipLiveCarouselItemWrapper key={index} songHeader={songHeader} setMusicSheetCounts={setMusicSheetCounts} />
                        ))
                    }
                </CarouselContent>
            </Carousel>
        </div>
    )
}
