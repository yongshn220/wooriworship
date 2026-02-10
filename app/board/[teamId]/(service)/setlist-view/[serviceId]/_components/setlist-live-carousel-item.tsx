"use client";
import * as React from "react";
import Image from "next/image";
import { CarouselItem } from "@/components/ui/carousel";
import { useRecoilValue } from "recoil";
import { cn } from "@/lib/utils";
import { setlistViewPageModeAtom } from "../_states/setlist-view-states";
import { useEffect, useState, useRef } from "react";
import { SetlistViewPageMode } from "@/components/constants/enums";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import dynamic from "next/dynamic";
const AnnotationReadonlyOverlay = dynamic(() => import("./annotation-readonly-overlay").then(mod => mod.AnnotationReadonlyOverlay), { ssr: false });

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
    const [enablePan, setEnablePan] = useState(false)
    const [currentScale, setCurrentScale] = useState(1)
    const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Check cached image dimensions on mount
    useEffect(() => {
        const img = containerRef.current?.querySelector('img[alt="Music score"]') as HTMLImageElement | null
        if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        }
    }, [urls])

    // Prevent Safari native pinch-zoom gestures
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const prevent = (e: Event) => e.preventDefault()
        el.addEventListener("gesturestart", prevent, { passive: false })
        el.addEventListener("gesturechange", prevent, { passive: false })
        return () => {
            el.removeEventListener("gesturestart", prevent)
            el.removeEventListener("gesturechange", prevent)
        }
    }, [])

    return (
        <CarouselItem className={cn("h-full p-0", { "basis-1/2": pageMode === SetlistViewPageMode.DOUBLE_PAGE })}>
            <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                wheel={{ activationKeys: ["Control", "Meta"], step: 0.07 }}
                doubleClick={{ mode: "toggle" }}
                panning={{
                    disabled: !enablePan,
                    allowLeftClickPan: true,
                    allowMiddleClickPan: true,
                    allowRightClickPan: true,
                }}
                pinch={{ disabled: false }}
                onTransformed={(e) => {
                    setEnablePan(e.state.scale > 1.01)
                    setCurrentScale(e.state.scale)
                }}
            >
                <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                >
                    <div ref={containerRef} className="h-full w-full flex flex-col bg-background overflow-y-auto scrollbar-hide overscroll-contain" style={{ touchAction: "none" }}>
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
                                    <AnnotationReadonlyOverlay
                                        teamId={teamId}
                                        songId={songId}
                                        sheetId={sheetId}
                                        pageIndex={pageIndex}
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
