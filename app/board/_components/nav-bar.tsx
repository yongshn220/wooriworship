'use client'

import {Button} from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  return (
    <div className="flex-end items-center gap-x-4 p-5">
      <Button variant="outline">Manage Team</Button>
      <Image
        src={"/image/profileIcon.png"}
        alt="Logo"
        height={35}
        width={35}
      />
    </div>
  )
}

