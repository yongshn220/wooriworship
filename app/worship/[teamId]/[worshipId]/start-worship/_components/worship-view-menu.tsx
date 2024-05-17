'use client'

import {useState} from "react";
import {cn} from "@/lib/utils";
import {useRecoilState} from "recoil";
import {worshipMenuAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {CopyIcon, MenuIcon, SquarePen, Trash2Icon} from "lucide-react";

export function WorshipViewMenu() {
  const [menu, setMenu] = useRecoilState(worshipMenuAtom)

  return (
    <div className="absolute top-2 right-2 bottom-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="p-4 rounded-full hover:bg-gray-100">
            <MenuIcon/>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2 mr-4">
          <DropdownMenuGroup className="space-y-2">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setMenu((prev) => ({...prev, showSongNote: !prev.showSongNote}))}>
               <CopyIcon className="mr-3 w-5 h-5"/>
               <p>Show Song Note</p>
             </DropdownMenuItem>
             <DropdownMenuItem className="cursor-pointer" onClick={() => setMenu((prev) => ({...prev, showSongNumber: !prev.showSongNumber}))}>
               <SquarePen className="mr-3 w-5 h-5"/>
               <p>Show Song Number</p>
             </DropdownMenuItem>
             <DropdownMenuItem className="cursor-pointer">
               <Trash2Icon className="mr-3 w-5 h-5"/>
               <p>Exit Worship</p>
             </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
