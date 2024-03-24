'use client'

import Image from "next/image";
import {ManageTeamButton} from "@/app/board/_components/nav-bar/manage-team-button";
import {SearchInput} from "@/app/board/song/_components/search-input";

export function Navbar() {
  return (
    <div className="flex-end p-5 gap-4">
      <SearchInput/>
      <ManageTeamButton/>
      <Image
        src={"/image/profileIcon.png"}
        alt="Logo"
        height={35}
        width={35}
      />
    </div>
  )
}

