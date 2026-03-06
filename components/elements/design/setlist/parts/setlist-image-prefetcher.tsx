"use client"

import { useEffect } from "react"
import { useRecoilValueLoadable } from "recoil"
import { setlistFlatPagesSelector } from "@/app/board/[teamId]/(service)/setlist-view/[serviceId]/_states/setlist-view-states"

interface Props {
    teamId: string
    serviceId: string
}

export function SetlistImagePrefetcher({ teamId, serviceId }: Props) {
    const flatPagesLoadable = useRecoilValueLoadable(
        setlistFlatPagesSelector({ teamId, serviceId })
    )

    useEffect(() => {
        if (flatPagesLoadable.state !== "hasValue") return

        const pages = flatPagesLoadable.contents
        if (!pages || pages.length === 0) return

        for (const page of pages) {
            if (page.url) {
                const img = new Image()
                img.src = page.url
            }
        }
    }, [flatPagesLoadable.state, flatPagesLoadable.contents])

    return null
}
