"use client"

import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {getPathPlan} from "@/components/helper/routes";
import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {BottomNavbar} from "@/app/board/_components/bottom-navbar/bottom-navbar";
import {WorshipBottomNavbar} from "@/app/worship/_components/bottom-navbar/worship-bottom-navbar";

interface Props {
  params: any
  children: React.ReactNode
}

export default function WorshipLayout({params, children}: Props) {
  const worshipId = params.worshipId
  const teamId = params.teamId

  return (
    <section className="w-full h-full">
      <PageInit teamId={teamId} page={Page.WORSHIP}/>
      <div className="w-full h-full flex">
        <MdSidebar>
          <MainLogoRouter route={getPathPlan(teamId)}/>
          <WorshipSidebar teamId={teamId} worshipId={worshipId}/>
        </MdSidebar>
        <div className="w-full h-full flex-1">
          <Navbar/>
          <div className="pt-4 sm:mt-0 flex-1 h-[calc(100%-160px)] px-6 overflow-y-scroll scrollbar-hide">
            {children}
          </div>
          <WorshipBottomNavbar teamId={teamId} worshipId={worshipId}/>
          <BottomNavbar/>
        </div>
      </div>
    </section>
  )
}
