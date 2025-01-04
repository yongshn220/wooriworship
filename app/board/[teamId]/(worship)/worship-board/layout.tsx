"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";

export default function PlanLayout({children}: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.WORSHIP_BOARD)
  }, [setPage]);

  return (
    <PullToRefresh>
      {children}
    </PullToRefresh>
  )
}
