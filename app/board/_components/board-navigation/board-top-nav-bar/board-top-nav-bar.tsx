import { Page } from "@/components/constants/enums";
import { FilterIcon, SquarePenIcon } from "lucide-react";
import React from "react";
import { useRecoilValue } from "recoil";
import { SearchInput } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-input";
import { SearchFilterPopover } from "@/app/board/_components/board-navigation/board-top-nav-bar/search-filter-popover";
import { getPathCreateNotice, getPathCreatePlan, getPathCreateSong } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { SearchPlan } from "./search-plan";
import { BaseTopNavBar } from "@/components/elements/util/navigation/base-top-nav-bar";
import { MainLogoSmall } from "@/components/elements/util/logo/main-logo";
import { currentPageAtom } from "@/global-states/page-state";


export function BoardTopNavBar() {
  const currentPage = useRecoilValue(currentPageAtom)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  const tabConfig: any = {
    [Page.NOTICE_BOARD]: { text: "Notice" },
    [Page.WORSHIP_BOARD]: { text: "Worship Plan" },
    [Page.SONG_BOARD]: { text: "Song Board" },
  };

  if ([Page.CREATE_WORSHIP, Page.EDIT_WORSHIP, Page.CREATE_SONG, Page.EDIT_SONG].includes(currentPage)) {
    return <></>
  }

  if ([Page.BOARD, Page.HOME, Page.WORSHIP, Page.CREATE_NOTICE].includes(currentPage)) {
    return (
      <BaseTopNavBar height={56}>
        <div className="w-full h-full flex px-4">
          <MainLogoSmall />
        </div>
      </BaseTopNavBar>
    )
  }

  if (currentPage === Page.NOTICE_BOARD) {
    return (
      <BaseTopNavBar height={80}>
        <div className="w-full h-full flex flex-col justify-end">
          <div className="flex-between w-full py-2 px-4">
            {
              tabConfig[currentPage] &&
              <p className="text-xl font-semibold">{tabConfig[currentPage].text}</p>
            }
            <SquarePenIcon className="cursor-pointer" onClick={() => router.push(getPathCreateNotice(teamId))} />
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
                <SquarePenIcon onClick={() => router.push(getPathCreateSong(teamId))} />
                <SearchFilterPopover>
                  <FilterIcon />
                </SearchFilterPopover>
              </div>
            </div>
            <div className="mt-2">
              <SearchInput />
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
                <SquarePenIcon className="cursor-pointer" onClick={() => router.push(getPathCreatePlan(teamId))} />
              </div>
            </div>
            <div className="mt-2">
              <SearchPlan />
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
