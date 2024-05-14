"use client"
import Link from 'next/link'
import {Button} from "@/components/ui/button";
import {LayoutDashboard, LibraryBig} from 'lucide-react';
import {Page} from "@/components/constants/enums";
import {TeamSelect} from "@/app/board/_components/board-sidebar/team-select";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {useRecoilValue} from "recoil";
import {currentPageAtom} from "@/app/board/_states/board-states";
import {getPathBoard, getPathPlan, getPathSong} from "@/components/helper/routes";
import {currentTeamIdAtom} from "@/global-states/teamState";


export function BoardSidebar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)

  return (
    <MdSidebar>
      <MainLogoRouter route={getPathPlan(currentTeamId)}/>
      <div className="space-y-2 w-full">
        <TeamSelect/>
        <Button variant={(currentPage === Page.PLAN)? "secondary" : "ghost"} asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={getPathPlan(currentTeamId)}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Worship Plan
          </Link>
        </Button>
        <Button variant={(currentPage === Page.SONG)? "secondary" : "ghost"} asChild size="lg" className="font-normal w-full justify-start px-2">
          <Link href={getPathSong(currentTeamId)}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Song Board
          </Link>
        </Button>
      </div>
    </MdSidebar>
  )
}
