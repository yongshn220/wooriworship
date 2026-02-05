import * as React from "react";
import Image from "next/image";
import { CarouselItem } from "@/components/ui/carousel";
import { SetlistSongHeader } from "@/models/setlist";
import { useRecoilValue } from "recoil";
import { musicSheetsByIdsAtom } from "@/global-states/music-sheet-state";
import { cn } from "@/lib/utils";
import { setlistViewPageModeAtom } from "../_states/setlist-view-states";
import { MusicSheetCounts } from "./setlist-live-carousel";
import { useEffect, useMemo, useState, useRef } from "react";
import { MusicSheet } from "@/models/music_sheet";
import { DirectionType, SetlistViewPageMode } from "@/components/constants/enums";
import { setlistMultipleSheetsViewModeAtom } from "../_states/setlist-view-states";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { annotationDrawingModeAtom } from "../_states/annotation-states";
import { setlistIndexAtom } from "../_states/setlist-view-states";
import { AnnotationCanvas } from "./annotation-canvas";


interface Props {
    teamId: string
    songHeader: SetlistSongHeader
    setMusicSheetCounts: React.Dispatch<React.SetStateAction<Array<MusicSheetCounts>>>
    globalStartIndex: number
}

export function SetlistLiveCarouselItemWrapper({ teamId, songHeader, setMusicSheetCounts, globalStartIndex }: Props) {
    const musicSheets = useRecoilValue(musicSheetsByIdsAtom({ teamId, songId: songHeader?.id, ids: songHeader?.selected_music_sheet_ids }))

    const multipleSheetsViewMode = useRecoilValue(setlistMultipleSheetsViewModeAtom)

    type AnnotatedMusicSheet = MusicSheet & { _pageIndex: number; _songId: string }

    const modifiedMusicSheets = useMemo(() => {
        const results: Array<AnnotatedMusicSheet> = []

        if (multipleSheetsViewMode === DirectionType.VERTICAL) {
            const allUrls: string[] = []
            musicSheets.forEach(sheet => {
                if (sheet?.urls) allUrls.push(...sheet.urls)
            })
            if (allUrls.length > 0 && musicSheets.length > 0) {
                results.push({ ...musicSheets[0], urls: allUrls, _pageIndex: 0, _songId: songHeader?.id })
            }
        } else {
            musicSheets.forEach(musicSheet => {
                musicSheet?.urls.forEach((url, urlIdx) => {
                    results.push({ ...musicSheet, urls: [url], _pageIndex: urlIdx, _songId: songHeader?.id })
                })
            })
        }
        return results

    }, [musicSheets, multipleSheetsViewMode, songHeader?.id])

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
                    <SetlistLiveCarouselItem key={index} globalIndex={globalStartIndex + index} urls={musicSheet?.urls} teamId={teamId} songId={musicSheet._songId} sheetId={musicSheet.id || ""} pageIndex={musicSheet._pageIndex} />
                ))
            }
        </React.Fragment>
    )
}



interface SetlistLiveCarouselItemProps {
    globalIndex: number
    urls: Array<string>
    teamId: string
    songId: string
    sheetId: string
    pageIndex: number
}

export function SetlistLiveCarouselItem({ globalIndex, urls, teamId, songId, sheetId, pageIndex }: SetlistLiveCarouselItemProps) {
    const pageMode = useRecoilValue(setlistViewPageModeAtom)
    const drawingMode = useRecoilValue(annotationDrawingModeAtom)
    const setlistIndex = useRecoilValue(setlistIndexAtom)
    const [enablePan, setEnablePan] = useState(false)
    const [currentScale, setCurrentScale] = useState(1)
    const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const isActiveSlide = setlistIndex.current === globalIndex

    // Check image dimensions after mount (for cached images where onLoad may not fire)
    useEffect(() => {
        let mounted = true

        const checkDimensions = () => {
            // Try containerRef first, fall back to document query
            let img = containerRef.current?.querySelector('img[alt="Music score"]') as HTMLImageElement | null
            if (!img) {
                // Fallback: query from document (for when ref isn't ready yet)
                img = document.querySelector('img[alt="Music score"]') as HTMLImageElement | null
            }
            if (img && img.naturalWidth > 0 && img.naturalHeight > 0 && mounted) {
                setNaturalDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                })
                return true
            }
            return false
        }

        // Check immediately
        if (checkDimensions()) return

        // If not found, poll with interval until found
        const interval = setInterval(() => {
            if (checkDimensions()) {
                clearInterval(interval)
            }
        }, 100)

        // Cleanup after 3 seconds to prevent memory leak
        const timeout = setTimeout(() => clearInterval(interval), 3000)

        return () => {
            mounted = false
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [urls])

    return (
        <CarouselItem className={cn("h-full p-0", { "basis-1/2": pageMode === SetlistViewPageMode.DOUBLE_PAGE })}>
            <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                wheel={{ disabled: true }}
                doubleClick={{ mode: "toggle", disabled: drawingMode }}
                panning={{ disabled: drawingMode || !enablePan }}
                pinch={{ disabled: drawingMode }}
                onTransformed={(e) => {
                    setEnablePan(e.state.scale > 1.01)
                    setCurrentScale(e.state.scale)
                }}
            >
                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                >
                    <div ref={containerRef} className="h-full w-full flex flex-col bg-background overflow-y-auto scrollbar-hide overscroll-contain">
                        {
                            urls.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex-center w-full h-full p-1 select-none shrink-0"
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
                                        onLoad={(e) => {
                                            const img = e.currentTarget as HTMLImageElement
                                            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                                                setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-0 z-10" />
                                    <AnnotationCanvas
                                        teamId={teamId}
                                        songId={songId}
                                        sheetId={sheetId}
                                        pageIndex={pageIndex}
                                        isActiveSlide={isActiveSlide}
                                        currentScale={currentScale}
                                        naturalWidth={naturalDimensions.width}
                                        naturalHeight={naturalDimensions.height}
                                    />
                                </div>
                            ))
                        }
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </CarouselItem>
    )
}
