import {FormMode, Page} from "@/components/constants/enums";
import {FilterIcon, SquarePenIcon} from "lucide-react";
import React, {Suspense, useState} from "react";
import {useRecoilValue} from "recoil";
import {SearchInput} from "@/app/board/_components/board-navigation/board-top-nav-bar/search-input";
import {SearchFilterPopover} from "@/app/board/_components/board-navigation/board-top-nav-bar/search-filter-popover";
import {getPathCreatePlan, getPathCreateSong} from "@/components/util/helper/routes";
import {useRouter} from "next/navigation";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {NoticeForm} from "@/components/elements/design/notice/notice-form/notice-form";
import {SearchPlan} from "./search-plan";
import {BaseTopNavBar} from "@/components/elements/util/navigation/base-top-nav-bar";
import {MainLogoSmall} from "@/components/elements/util/logo/main-logo";
import {currentPageAtom} from "@/global-states/page-state";


export function BoardTopNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()
  const [isCreateNoticeDialogOpen, setCreateNoticeDialogOpen] = useState(false)

  function handleCreatePlanClick() {
    router.push(getPathCreatePlan(teamId))
  }

  function handleCreateNoticeClick() {
    setCreateNoticeDialogOpen(true)
  }

  const tabConfig: any = {
    [Page.NOTICE_BOARD]: { text: "Notice", createHandler: handleCreateNoticeClick },
    [Page.WORSHIP_BOARD]: { text: "Worship Plan", createHandler: handleCreatePlanClick },
    [Page.SONG_BOARD]: { text: "Song Board", createHandler: () => {} },
  };

  if (currentPage === Page.HOME || currentPage === Page.CREATE_SONG || currentPage === Page.EDIT_SONG || currentPage === Page.CREATE_WORSHIP || currentPage === Page.EDIT_WORSHIP || currentPage === Page.WORSHIP) {
    return (
      <BaseTopNavBar height={56}>
        <div className="w-full h-full flex px-4">
          <MainLogoSmall/>
        </div>
      </BaseTopNavBar>
    )
  }

  if (currentPage === Page.NOTICE_BOARD) {
    return (
      <BaseTopNavBar height={80}>
        <Suspense>
          <NoticeForm mode={FormMode.CREATE} isOpen={isCreateNoticeDialogOpen} setIsOpen={setCreateNoticeDialogOpen}/>
        </Suspense>
        <div className="w-full h-full flex flex-col justify-end">
          <div className="flex-between w-full py-2 px-4">
            {
              tabConfig[currentPage] &&
              <p className="text-xl font-semibold">{tabConfig[currentPage].text}</p>
            }
            <SquarePenIcon className="cursor-pointer" onClick={() => tabConfig[currentPage].createHandler()}/>
          </div>
        </div>
      </BaseTopNavBar>
    )
  }

  if (currentPage === Page.SONG_BOARD) {
    return (
      <BaseTopNavBar height={120}>
        <div className="w-full h-full flex flex-col justify-end">
          <div className="flex flex-col w-full py-2 px-4">
            <div className="flex-between">
              {
                tabConfig[currentPage] &&
                <p className="text-xl font-semibold">{tabConfig[currentPage].text}</p>
              }
              <div className="flex gap-4">
                <SquarePenIcon onClick={() => router.push(getPathCreateSong(teamId))}/>
                <SearchFilterPopover>
                  <FilterIcon/>
                </SearchFilterPopover>
              </div>
            </div>
            <div className="mt-2">
              <SearchInput/>
            </div>
          </div>
        </div>
      </BaseTopNavBar>
    )
  }

  if (currentPage === Page.WORSHIP_BOARD) {
    return (
      <BaseTopNavBar height={120}>
        <div className="w-full h-full flex flex-col justify-end">
          <div className="flex flex-col w-full py-2 px-4">
            <div className="flex-between">
              {
                tabConfig[currentPage] &&
                <p className="text-xl font-semibold">{tabConfig[currentPage].text}</p>
              }
              <div className="flex gap-4">
              <SquarePenIcon className="cursor-pointer" onClick={() => tabConfig[currentPage].createHandler()}/>
              </div>
            </div>
            <div className="mt-2">
              <SearchPlan/>
            </div>
          </div>
        </div>
      </BaseTopNavBar>
    )
  }

  if (currentPage === Page.MANAGE) {
    return (
      <BaseTopNavBar height={80}>
        <div className="w-full h-full flex flex-col justify-end">
          <div className="w-full py-2 px-4">
            <p className="text-xl font-semibold">Manage</p>
          </div>
        </div>
      </BaseTopNavBar>
    )
  }

  return (
    <></>
  )
}
