"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";
import {currentWorshipIdAtom} from "@/global-states/worship-state";

export default function WorshipLayout({params, children}: any) {
  const worshipId = params.worshipId
  const setWorshipId = useSetRecoilState(currentWorshipIdAtom)
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.WORSHIP)
    setWorshipId(worshipId)
  }, [worshipId, setWorshipId, setPage]);

  return (
    <PullToRefresh>
      {children}
    </PullToRefresh>
  )
}