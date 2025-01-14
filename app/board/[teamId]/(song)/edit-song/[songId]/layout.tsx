"use client"

import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {Page} from "@/components/constants/enums";

export default function EditSongLayout({children}: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.EDIT_SONG)
  }, [setPage]);

  return (
    <div className="w-full">
      {children}
    </div>
  )
}

