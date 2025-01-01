"use client"
import {Button} from "@/components/ui/button";
import {CalendarIcon, CircleCheckIcon, FileMusicIcon, HomeIcon} from 'lucide-react';
import {Page} from "@/components/constants/enums";
import {TeamSelect} from "@/app/board/_components/board-sidebar/team-select";
import {MainLogoRouter} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";
import {useRecoilValue} from "recoil";
import {getPathHome, getPathNotice, getPathPlan, getPathSong} from "@/components/helper/routes";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {ManageTeamButton} from "@/app/board/_components/nav-bar/manage-team-button";
import {useRouter} from "next/navigation";
import {InvitationButton} from "@/components/dialog-manager/invitation/invitation-button";
import {ManageTeamDialog} from "@/app/board/_components/nav-bar/manage-team-dialog";
import React, {Suspense} from "react";
import {FallbackText} from "@/components/fallback-text";
import { currentPageAtom } from "@/global-states/page-state";

export function BoardSidebar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <MdSidebar>
      <MainLogoRouter route={""}/>
      <div className="flex-between flex-col w-full h-full">
        <div className="space-y-2 ">
          <Suspense fallback={<FallbackText text="Loading teams..."/>}>
            <TeamSelect createOption={true}/>
          </Suspense>
          <Button disabled={!currentTeamId} variant={(currentPage === Page.HOME)? "secondary" : "ghost"} size="lg" className="font-normal w-full justify-start px-2" onClick={() => router.push(getPathHome(currentTeamId))}>
            <HomeIcon className="h-4 w-4 mr-2"/>
            Home
          </Button>
          <Button disabled={!currentTeamId} variant={(currentPage === Page.NOTICE)? "secondary" : "ghost"} size="lg" className="font-normal w-full justify-start px-2" onClick={() => router.push(getPathNotice(currentTeamId))}>
            <CircleCheckIcon className="h-4 w-4 mr-2"/>
            Notice
          </Button>
          <Button disabled={!currentTeamId} variant={(currentPage === Page.PLAN)? "secondary" : "ghost"} size="lg" className="font-normal w-full justify-start px-2" onClick={() => router.push(getPathPlan(currentTeamId))}>
            <CalendarIcon className="h-4 w-4 mr-2"/>
            Worship Plan
          </Button>
          <Button disabled={!currentTeamId} variant={(currentPage === Page.SONG)? "secondary" : "ghost"} size="lg" className="font-normal w-full justify-start px-2" onClick={() => router.push(getPathSong(currentTeamId))}>
            <FileMusicIcon className="h-4 w-4 mr-2"/>
            Song Board
          </Button>
        </div>
        <div className="w-full mb-4 space-y-2">
          <Suspense fallback={<FallbackText text="Loading..."/>}>
            <InvitationButton/>
            <ManageTeamDialog>
              <ManageTeamButton/>
            </ManageTeamDialog>
          </Suspense>
        </div>
      </div>
    </MdSidebar>
  )
}
