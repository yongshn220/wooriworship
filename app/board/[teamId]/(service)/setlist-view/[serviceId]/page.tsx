"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { SetlistLiveCarousel } from "./_components/setlist-live-carousel"
import { SetlistControlDock } from "./_components/setlist-control-dock"
import { SetlistIndexIndicator } from "./_components/setlist-index-indicator"
import { SetlistNote } from "./_components/setlist-note"
import { setlistIndexChangeEventAtom, setlistIndexAtom } from "./_states/setlist-view-states"
import { annotationDrawingModeAtom } from "./_states/annotation-states"

interface Props {
    params: { teamId: string; serviceId: string }
    searchParams: { page?: string; songId?: string }
}

export default function SetlistViewPage({ params, searchParams }: Props) {
    const teamId = params.teamId
    const serviceId = params.serviceId
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const targetPage = parseInt(searchParams.page || "0")
    const setSetlistIndexChangeEvent = useSetRecoilState(setlistIndexChangeEventAtom)
    const setlistIndex = useRecoilValue(setlistIndexAtom)
    const setDrawingMode = useSetRecoilState(annotationDrawingModeAtom)

    // Ensure drawing mode is off when viewing setlist
    useEffect(() => {
        setDrawingMode(false)
    }, [setDrawingMode])

    // Set initial page from URL query param (ALWAYS, even if 0)
    useEffect(() => {
        setSetlistIndexChangeEvent({ page: targetPage, timestamp: Date.now() })
    }, [targetPage, setSetlistIndexChangeEvent])

    const currentIndex = setlistIndex.current

    // Update URL when carousel index changes (without adding to history)
    useEffect(() => {
        const currentUrl = new URL(window.location.href)
        const currentPageParam = currentUrl.searchParams.get("page")
        const urlTargetPage = parseInt(searchParams.page || "0")

        // Skip update if we're still syncing to URL target page
        if (currentIndex !== urlTargetPage) {
            return
        }

        // Only update if the page param differs
        if (currentPageParam !== String(currentIndex)) {
            router.replace(
                `/board/${teamId}/setlist-view/${serviceId}?page=${currentIndex}`,
                { scroll: false }
            )
        }
    }, [currentIndex, router, teamId, serviceId, searchParams.page])

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-background overflow-hidden touch-none"
        >
            <SetlistLiveCarousel teamId={teamId} serviceId={serviceId} initialPage={targetPage} initialSongId={searchParams.songId} />
            <SetlistNote constraintsRef={containerRef} />
            <SetlistControlDock teamId={teamId} serviceId={serviceId} />
            <SetlistIndexIndicator />
        </div>
    )
}
