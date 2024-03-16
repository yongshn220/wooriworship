'use client'

import {Button} from "@/components/ui/button";
import Image from "next/image";
import {ManageTeamButton} from "@/app/board/_components/nav-bar/manage-team-button";

export function Navbar() {
  return (
    <div className="flex-end items-center gap-x-4 p-5">
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

