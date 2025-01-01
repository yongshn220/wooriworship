"use client"

import {BoardAuthenticate} from "@/app/board/_components/auth/board-authenticate";
import { BoardTopNavBar } from "@/app/board/_components/board-navigation/board-top-nav-bar";
import { BoardBottomeNavBar } from "@/app/board/_components/board-navigation/board-bottom-nav-bar";
import { BoardInitializer } from "@/app/board/_components/configuration/board-initializer";
import { DialogManager } from "@/components/dialog-manager/dialog-manager";
import { usePathname } from "next/navigation";


export default function BoardLayout({ children }: any) {
  console.log("----BoardLayout")
  const pathname = usePathname()

  return (
    <section className="h-full">
      <BoardAuthenticate>
        <DialogManager/>
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
