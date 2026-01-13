"use client"

import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";

export default function SongLayout({ children }: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.SONG_BOARD)
  }, [setPage]);

  return (
  return (
    <div className="bg-background w-full h-full">
      {children}
    </div>
  )
  )
}

