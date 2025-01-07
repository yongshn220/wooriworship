"use client"

import {PullToRefresh} from "@/components/functionality/pull-to-refresh";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";

export default function ManageLayout({children}: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.MANAGE)
  }, [setPage]);

  return (
    <PullToRefresh>
      <div className="h-full p-4 bg-white">
        {children}
      </div>
    </PullToRefresh>
  )
}
