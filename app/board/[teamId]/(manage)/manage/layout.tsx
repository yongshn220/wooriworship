"use client"

import { PullToRefresh } from "@/components/elements/util/page/pull-to-refresh";
import { useSetRecoilState } from "recoil";
import { currentPageAtom } from "@/global-states/page-state";
import { useEffect } from "react";
import { Page } from "@/components/constants/enums";

import { usePathname } from "next/navigation";

export default function ManageLayout({ children }: any) {
  const setPage = useSetRecoilState(currentPageAtom)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.endsWith("/manage")) {
      setPage(Page.MANAGE)
    } else {
      setPage(Page.MANAGE_SUBPAGE)
    }
  }, [setPage, pathname]);

  return (
    <PullToRefresh>
      <div className="h-full">
        {children}
      </div>
    </PullToRefresh>
  )
}
