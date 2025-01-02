"use client"

import {Navbar} from "@/app/board/_components/nav-bar/nav-bar";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {getPathPlan} from "@/components/helper/routes";
import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {WorshipBottomNavbar} from "@/app/worship/_components/bottom-navbar/worship-bottom-navbar";
import { BoardBottomNavBar } from "@/app/board/_components/board-navigation/board-bottom-nav-bar";

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
      <div className="flex flex-col h-screen">
        <Navbar/>
        <main className="flex-grow overflow-y-auto p-4">
          {children}
        </main>
        <WorshipBottomNavbar teamId={teamId} worshipId={worshipId}/>
        <BoardBottomNavBar/>
      </div>
    </section>
  )
}


