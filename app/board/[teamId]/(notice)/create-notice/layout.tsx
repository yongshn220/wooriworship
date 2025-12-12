"use client"

import { Page } from "@/components/constants/enums";
import { currentPageAtom } from "@/global-states/page-state";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";


export default function CreateNoticeLayout({ children }: any) {
  const setPage = useSetRecoilState(currentPageAtom)

  useEffect(() => {
    setPage(Page.CREATE_NOTICE)
  }, [setPage]);

  return (
    <div className="bg-background p-4">
      {children}
    </div>
  )
}