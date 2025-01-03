"use client"

import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";
import { BoardTopNavBar } from "@/app/board/_components/board-navigation/board-top-nav-bar";
import { BoardBottomNavBar } from "@/app/board/_components/board-navigation/board-bottom-nav-bar";
import { BoardInitializer } from "@/app/board/_components/configuration/board-initializer";
import { DialogManager } from "@/components/dialog/static-dialog/dialog-manager";
import { usePathname } from "next/navigation";
import {useSetRecoilState} from "recoil";
import {currentPageAtom} from "@/global-states/page-state";
import {useEffect} from "react";
import {Page} from "@/components/constants/enums";


export default function BoardLayout({ children }: any) {
  const setPage = useSetRecoilState(currentPageAtom)
  const pathname = usePathname()


  useEffect(() => {
    if (!pathname) {
      return;
    }
    if (/^\/board$/.test(pathname)) {
      setPage(Page.BOARD)
    }
  })

  console.log("----BoardLayout")
  return (
    <section className="h-full">
      <BoardAuthenticate>
        <DialogManager/>
        <div className="flex flex-col h-screen">
          <BoardTopNavBar/>
          <main className="flex-grow overflow-y-auto bg-gray-50 p-4">
            {children}
          </main>
          <BoardBottomNavBar/>
        </div>
      </BoardAuthenticate>
    </section>
  )
}
