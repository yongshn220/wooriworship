"use client"

import {PullToRefresh} from "@/components/elements/util/page/pull-to-refresh";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";

export default function NoticeLayout({children}: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.NOTICE_BOARD)
  }, [setPage]);

  return (
    <PullToRefresh>
      <div className="p-4">
        {children}
      </div>
    </PullToRefresh>
  )
}
