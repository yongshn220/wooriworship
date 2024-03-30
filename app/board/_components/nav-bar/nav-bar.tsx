'use client'

import Image from "next/image";
import {ManageTeamButton} from "@/app/board/_components/nav-bar/manage-team-button";
import {SearchInput} from "@/app/board/_components/nav-bar/search-input";
import {SearchTags} from "@/app/board/_components/nav-bar/search-tags";
import {cn} from "@/lib/utils";
import {Routes} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {currentPageAtom} from "@/app/board/_states/pageState";
import {ProfileButton} from "@/app/board/_components/nav-bar/profile-button";

export function Navbar() {
  const currentPage = useRecoilValue(currentPageAtom)
  return (
    <div className="flex-between p-5 gap-4">
      <div className="flex-1">
        <div className={cn("hidden w-full max-w-4xl gap-4", {"flex-center": currentPage === Routes.SONG})}>
          <SearchInput/>
          <SearchTags/>
        </div>
      </div>
      <div className=" flex-end gap-4">
        <ManageTeamButton/>
        <ProfileButton/>
      </div>
    </div>
  )
}

