"use client"

import { BoardAuthenticate } from "@/app/board/_components/auth/board-authenticate";
import { BoardTopNavBar } from "@/app/board/_components/board-navigation/board-top-nav-bar/board-top-nav-bar";
import { BoardBottomNavBar } from "@/app/board/_components/board-navigation/board-bottom-nav-bar/board-bottom-nav-bar";
import { usePathname } from "next/navigation";
import { useSetRecoilState } from "recoil";
import { currentPageAtom } from "@/global-states/page-state";
import { useEffect } from "react";
import { Page } from "@/components/constants/enums";
import { DialogManager } from "@/components/elements/dialog/static-dialog/dialog-manager";
import Initialization from "@/components/util/provider/initialization";


export default function BoardLayout({ children }: any) {
  const setPage = useSetRecoilState(currentPageAtom)
  const pathname = usePathname()


  useEffect(() => {
    // Global Navigation Cleanup:
    // When navigating between pages, ensure any lingering body locks (from closed/unmounted modals) are removed.
    // This addresses issues where libraries like 'vaul' might leave pointer-events: none on the body if navigation happens rapidly.
    if (document.body.style.pointerEvents === 'none') {
      document.body.style.removeProperty('pointer-events');
    }

    if (/^\/board$/.test(pathname)) {
      setPage(Page.BOARD)
    }
  }, [pathname, setPage])

  console.log("----BoardLayout")
  return (
    <section className="h-full">
      <BoardAuthenticate>
        <Initialization />
        <DialogManager />
        <div className="flex flex-col h-full">
          <BoardTopNavBar />
          <main className="flex-grow min-h-0 overflow-y-auto bg-gray-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] overscroll-contain">
            {children}
          </main>
          <BoardBottomNavBar />
        </div>
      </BoardAuthenticate>
    </section>
  )
}
