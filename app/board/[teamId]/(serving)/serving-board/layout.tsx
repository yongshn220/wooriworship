"use client"

import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";


export default function ServingLayout({ children }: { children: React.ReactNode }) {
    const setPage = useSetRecoilState(currentPageAtom)

    useEffect(() => {
        setPage(Page.SERVING)
    }, [setPage]);

    return (
        <div className="w-full h-full">
            {children}
        </div>
    )
}
