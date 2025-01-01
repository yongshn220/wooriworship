'use client'

import {SearchInput} from "@/app/board/_components/nav-bar/search-input";
import {SearchFilterPopover} from "@/app/board/_components/nav-bar/search-filter-popover";
import {cn} from "@/lib/utils";
import {Page} from "@/components/constants/enums";
import {useRecoilState, useRecoilValue} from "recoil";
import {ProfileButton} from "@/app/board/_components/nav-bar/profile-button";
import {NewSongButton} from "@/app/board/[teamId]/song/_components/new-song-button";
import {NewWorshipButton} from "@/app/board/[teamId]/plan/_components/new-worship-button";
import {invitationDialogStateAtom} from "@/global-states/dialog-state";
import React, {Suspense} from "react";
import {FallbackText} from "@/components/fallback-text";
import {CircleCheckIcon, HomeIcon, CalendarIcon, FileMusicIcon, Settings2Icon} from "lucide-react";
import {NewNoticeButton} from "@/app/board/[teamId]/_components/new-notice-button";
import {Button} from "@/components/ui/button";
import { SearchPlan } from "./search-plan";
import { currentPageAtom } from "@/components/states/page-states";
import { InvitationInboxDialog } from "../../[teamId]/_components/dialog-manager/invitation/invitation-inbox-dialog";

export function Navbar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const [invitationDialogState, setInvitationDialogState] = useRecoilState(invitationDialogStateAtom)

  const tabConfig: any = {
    [Page.HOME]: { icon: <HomeIcon aria-hidden="true" />, text: "Home" },
    [Page.NOTICE]: { icon: <CircleCheckIcon aria-hidden="true" />, text: "Notice" },
    [Page.PLAN]: { icon: <CalendarIcon aria-hidden="true" />, text: "Worship Plan" },
    [Page.SONG]: { icon: <FileMusicIcon aria-hidden="true" />, text: "Song Board" },
  };

  return (
    <div className="hidden lg:flex top-0 sticky content-between items-center py-4 gap-4 border-b bg-white/95 z-40 px-4">
      <InvitationInboxDialog isOpen={invitationDialogState} setIsOpen={setInvitationDialogState}/>
      <div className="flex-center h-full">
        {
          tabConfig[currentPage] &&
          <>
            {tabConfig[currentPage].icon}
            <p className="ml-2">{tabConfig[currentPage].text}</p>
          </>
        }
      </div>
      <div className="flex-1 px-4">
        {
          (currentPage === Page.SONG) &&
          <div className={cn("flex-center w-full max-w-xl gap-4")}>
            <SearchInput/>
            <SearchFilterPopover>
              <>
                <Button variant="outline" className="gap-2">
                <Settings2Icon/>
                  <p>Modify Result</p>
                </Button>
              </>
            </SearchFilterPopover>
          </div>
        }
        {
          (currentPage === Page.PLAN) &&
          <div className={cn("flex-center w-full max-w-xl gap-4")}>
            <SearchPlan/>
          </div>
        }
      </div>
      <div className=" flex-end gap-4">
        {
          (currentPage === Page.NOTICE) &&
          <NewNoticeButton/>
        }
        {
          (currentPage === Page.SONG) &&
          <NewSongButton/>
        }
        {
          (currentPage === Page.PLAN) &&
          <NewWorshipButton/>
        }
        <Suspense fallback={<FallbackText text=""/>}>
          <ProfileButton/>
        </Suspense>
      </div>
    </div>
  )
}

