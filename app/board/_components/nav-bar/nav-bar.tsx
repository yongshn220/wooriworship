'use client'

import {SearchInput} from "@/app/board/_components/nav-bar/search-input";
import {SearchTags} from "@/app/board/_components/nav-bar/search-tags";
import {cn} from "@/lib/utils";
import {Page} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {currentPageAtom} from "@/app/board/_states/board-states";
import {ProfileButton} from "@/app/board/_components/nav-bar/profile-button";
import {NewSongButton} from "@/app/board/[teamId]/song/_components/new-song-button";
import {NewWorshipButton} from "@/app/board/[teamId]/plan/_components/new-worship-button";

export function Navbar() {
  const currentPage = useRecoilValue(currentPageAtom)
  return (
    <div className="flex-between p-5 gap-4">
      <div className="flex-1">
        {
          (currentPage === Page.SONG) &&
          <div className={cn("flex-center w-full max-w-xl gap-4")}>
            <SearchInput/>
            <SearchTags/>
          </div>
        }
      </div>
      <div className=" flex-end gap-4">
        <NewWorshipButton/>
        <NewSongButton/>
        <ProfileButton/>
      </div>
    </div>
  )
}

