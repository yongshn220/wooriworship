"use client"

import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";
import { SetlistLivePreference } from "./_components/setlist-live-preference";

export default function SetlistViewLayout({ children }: any) {
    const setPage = useSetRecoilState(currentPageAtom)

    useEffect(() => {
        setPage(Page.SETLIST_VIEW)
    }, [setPage])

    return (
        <div className="w-full h-full">
            <SetlistLivePreference />
            {children}
        </div>
    )
}
