"use client"

import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {getPathPlan} from "@/components/helper/routes";
import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {BottomNavbar} from "@/app/worship/_components/bottom-navbar/bottom-navbar";

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
      <div className="flex gap-x-3 h-full">
        <MdSidebar>
          <MainLogoRouter route={getPathPlan(teamId)}/>
          <WorshipSidebar teamId={teamId} worshipId={worshipId}/>
        </MdSidebar>
        <div className="h-full flex-1">
          <Navbar/>
          <div className="pt-4 sm:mt-0 flex-1 h-[calc(100%-80px)] px-6 overflow-y-scroll scrollbar-hide">
            {children}
          </div>
          <BottomNavbar teamId={teamId} worshipId={worshipId}/>
        </div>
      </div>
    </section>
  )
}
