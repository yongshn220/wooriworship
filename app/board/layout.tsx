"use client"

import {BoardSidebar} from "@/app/board/_components/board-sidebar/board-sidebar";
import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";
import {BottomNavbar} from "@/app/board/_components/bottom-navbar/bottom-navbar";
import {PullToRefresh} from "@/components/functionality/pull-to-refresh";
import {TopNavbarMobile} from "@/app/board/_components/top-navbar-mobile/top-navbar-mobile";


export default function BoardLayout({ children }: any) {
  console.log("----BoardLayout")

  return (
    <section className="h-full">
      <BoardAuthenticate>
        <div className="flex h-full">
          <BoardSidebar/>
          <div className="flex flex-col h-screen flex-1">
            <Navbar/>
            <TopNavbarMobile/>
            <div className="flex-1 pt-4 sm:mt-0 px-2 sm:px-6 overflow-y-scroll bg-gray-50">
              {children}
            </div>
            <BottomNavbar/>
          </div>
        </div>
      </BoardAuthenticate>
    </section>
  )
}
///h-[calc(100%-80px)]
