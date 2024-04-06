"use client"
import Link from 'next/link'
import {Button} from "@/components/ui/button";
import {LayoutDashboard, LibraryBig} from 'lucide-react';
import {Routes} from "@/components/constants/enums";
import {TeamSelect} from "@/app/board/_components/board-sidebar/team-select";
import {MainLogo} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {useRecoilValue} from "recoil";
import {currentPageAtom} from "@/app/board/_states/pageState";


export function BoardSidebar() {
  const currentPage = useRecoilValue(currentPageAtom)

  return (
    <MdSidebar>
      <MainLogo/>
      <div className="space-y-2 w-full">
        <TeamSelect/>
        <Button variant={(currentPage === Routes.PLAN)? "secondary" : "ghost"} asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={Routes.PLAN}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Worship Plan
          </Link>
        </Button>
        <Button variant={(currentPage === Routes.SONG) ? "secondary" : "ghost"} asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={Routes.SONG}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Song Board
          </Link>
        </Button>
      </div>
    </MdSidebar>
  )
}
