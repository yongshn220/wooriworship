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
import {getPathPlan, getPathSong, getPathWorship} from "@/components/helper/routes";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {ManageTeamButton} from "@/app/board/_components/nav-bar/manage-team-button";
import {useRouter} from "next/navigation";


export function BoardSidebar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <MdSidebar>
      <MainLogoRouter route={""}/>
      <div className="flex-between flex-col w-full h-full">
        <div className="space-y-2 ">
          <TeamSelect/>
          <Button disabled={!currentTeamId} variant={(currentPage === Page.PLAN)? "secondary" : "ghost"} size="lg" className="font-normal w-full justify-start px-2" onClick={() => router.push(getPathPlan(currentTeamId))}>
            <LayoutDashboard className="h-4 w-4 mr-2"/>
            Worship Plan
          </Button>
          <Button disabled={!currentTeamId} variant={(currentPage === Page.SONG)? "secondary" : "ghost"} size="lg" className="font-normal w-full justify-start px-2" onClick={() => router.push(getPathSong(currentTeamId))}>
            <LibraryBig className="h-4 w-4 mr-2"/>
            Song Board
          </Button>
        </div>
        <div className="w-full mb-4">
          <ManageTeamButton/>
        </div>
      </div>
    </MdSidebar>
  )
}
