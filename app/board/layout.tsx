"use client"

import {BoardSidebar} from "@/app/board/_components/board-sidebar/board-sidebar";
import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";
import {BottomNavbar} from "@/app/board/_components/bottom-navbar/bottom-navbar";


export default function BoardLayout({ children }: any) {

  return (
    <section className="h-full">
      <BoardAuthenticate>
        <div className="flex gap-x-3 h-full">
          <BoardSidebar/>
          <div className="h-full flex-1">
            <Navbar/>
            <div className="pt-4 sm:mt-0 flex-1 h-[calc(100%-80px)] px-6 overflow-y-scroll scrollbar-hide">
              {children}
            </div>
            <div>
              <BottomNavbar/>
            </div>
          </div>
        </div>
      </BoardAuthenticate>
    </section>
  )
}
