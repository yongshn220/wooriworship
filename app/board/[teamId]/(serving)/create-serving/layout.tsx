"use client"

import { Page } from "@/components/constants/enums";
import { currentPageAtom } from "@/global-states/page-state";
import { useSetRecoilState } from "recoil";
import { useEffect } from "react";

export default function CreateServingLayout({ children }: { children: React.ReactNode }) {
    const setPage = useSetRecoilState(currentPageAtom)

    useEffect(() => {
        setPage(Page.CREATE_SERVING)
    }, [setPage]);

    return (
        <div className="w-full h-full">
            {children}
        </div>
    )
}
