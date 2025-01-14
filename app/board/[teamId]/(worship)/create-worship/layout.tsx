"use client"

import {useEffect} from "react";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {Page} from "@/components/constants/enums";

export default function CreateWorshipLayout({children}: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.CREATE_WORSHIP)
  }, [setPage]);

  return (
    <div className="bg-white p-4">
      {children}
    </div>
  )
}

