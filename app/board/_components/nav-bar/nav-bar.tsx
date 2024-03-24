'use client'

import Image from "next/image";
import {ManageTeamButton} from "@/app/board/_components/nav-bar/manage-team-button";
import {SearchInput} from "@/app/board/_components/nav-bar/search-input";
import {SearchTags} from "@/app/board/_components/nav-bar/search-tags";

export function Navbar() {
  return (
    <div className="flex-between p-5 gap-4">
      <div className="flex-1 w-full max-w-4xl flex-center gap-4">
        <SearchInput/>
        <SearchTags/>
      </div>
      <div className=" flex-end gap-4">
        <ManageTeamButton/>
        <Image
          src={"/image/profileIcon.png"}
          alt="Logo"
          height={35}
          width={35}
        />
      </div>
    </div>
  )
}

