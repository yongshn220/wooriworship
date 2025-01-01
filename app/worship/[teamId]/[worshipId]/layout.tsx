"use client"

import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {getPathPlan} from "@/components/helper/routes";
import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {WorshipBottomNavbar} from "@/app/worship/_components/bottom-navbar/worship-bottom-navbar";
import { BoardBottomeNavBar } from "@/app/board/_components/board-navigation/board-bottom-nav-bar";

interface Props {
  params: any
  children: React.ReactNode
}

export default function WorshipLayout({params, children}: Props) {
  const worshipId = params.worshipId
  const teamId = params.teamId

  return (
    <section className="h-full">
      <PageInit teamId={teamId} page={Page.WORSHIP}/>
      <div className="h-full flex">
        <MdSidebar>
          <MainLogoRouter route={getPathPlan(teamId)}/>
          <WorshipSidebar teamId={teamId} worshipId={worshipId}/>
        </MdSidebar>
        <div className="flex flex-col h-screen flex-1 overflow-y-scroll">
          <Navbar/>
          <div className="pt-4 sm:mt-0 flex-1 px-6 ">
            {children}
          </div>
          <WorshipBottomNavbar teamId={teamId} worshipId={worshipId}/>
          <BoardBottomeNavBar/>
        </div>
      </div>
    </section>
  )
}


