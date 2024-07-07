import {Page} from "@/components/constants/enums";
import {FilterIcon, SquarePenIcon} from "lucide-react";
import React from "react";
import {useRecoilValue} from "recoil";
import {currentPageAtom} from "@/app/board/_states/board-states";
import Image from "next/image";
import {SearchInput} from "@/app/board/_components/nav-bar/search-input";
import {SearchFilterPopover} from "@/app/board/_components/nav-bar/search-filter-popover";
import {CreateSongDialog} from "@/components/dialog/create-song-dialog";
import {getPathCreatePlan} from "@/components/helper/routes";
import {useRouter} from "next/navigation";
import {currentTeamIdAtom} from "@/global-states/teamState";


export function TopNavbarMobile() {
  const currentPage = useRecoilValue(currentPageAtom)
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  function handleCreatePlanClick() {
    router.push(getPathCreatePlan(teamId))
  }

  const tabConfig: any = {
    [Page.NOTICE]: { text: "Notice (available soon)", createHandler: () => {} },
    [Page.PLAN]: { text: "Worship Plan", createHandler: handleCreatePlanClick },
    [Page.SONG]: { text: "Song Board", createHandler: () => {} },
  };

  if (currentPage === Page.HOME) {
    return (
      <div className="lg:hidden top-0 w-full h-[56px] border-b p-4">
        <div className="flex gap-1">
          <Image
            src={"/image/logo.png"}
            alt="Logo"
            height={25}
            width={25}
          />
          <p className="font-semibold">OORI</p>
        </div>
      </div>
    )
  }

  if (currentPage === Page.SONG) {
    return (
      <div className="lg:hidden top-0 w-full h-[120px] border-b">
        <div className="w-full h-full flex flex-col justify-end">
          <div className="flex flex-col w-full py-2 px-4">
            <div className="flex-between">
              {
                tabConfig[currentPage] &&
                <p className="text-xl font-semibold">{tabConfig[currentPage].text}</p>
              }
              <div className="flex gap-4">
                <CreateSongDialog>
                  <SquarePenIcon/>
                </CreateSongDialog>
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
      </div>
    )
  }

  if (!tabConfig[currentPage]) {
    return <></>
  }

  return (
    <div className="lg:hidden top-0 w-full h-[80px] bg-white border-b">
      <div className="w-full h-full flex flex-col justify-end">
        <div className="flex-between w-full py-2 px-4">
          {
            tabConfig[currentPage] &&
            <p className="text-xl font-semibold">{tabConfig[currentPage].text}</p>
          }
          <SquarePenIcon onClick={() => tabConfig[currentPage].createHandler()}/>
        </div>
      </div>
    </div>
  )
}
