"use client"

import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";
import { BoardTopNavBar } from "./_components/board-navigation/board-top-nav-bar";
import { BoardBottomeNavBar } from "./_components/board-navigation/board-bottom-nav-bar";
import { BoardInitializer } from "./_components/configuration/board-initializer";
import { usePathname } from "next/navigation";


export default function BoardLayout({ children }: any) {
  console.log("----BoardLayout")
  const pathname = usePathname()

  return (
    <section className="h-full">
      <BoardAuthenticate>
        <BoardInitializer pathname={pathname}>
          <div className="flex flex-col h-screen">
            <BoardTopNavBar/>
            <main className="flex-grow overflow-y-auto bg-gray-100 p-4">
              {children}
            </main>
            <BoardBottomeNavBar/>
          </div>
        </BoardInitializer>
      </BoardAuthenticate>
    </section>
  )
}
