'use client'

import NoteIcon from "@/public/icons/noteIcon.svg";
import SquareNumberIcon from "@/public/icons/squareNumberIcon.svg"
import UpIcon from "@/public/icons/upIcon.svg";
import DownIcon from "@/public/icons/downIcon.svg";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {useRecoilState} from "recoil";
import {worshipMenuAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";

export function WorshipViewMenu() {
  const [isOpen, setIsOpen] = useState(true)
  const [menu, setMenu] = useRecoilState(worshipMenuAtom)

  return (
    <div className="absolute flex-center flex-col w-10 gap-y-4 right-5 bottom-10">
      <div className={cn("space-y-4", {"hidden": !isOpen})}>
        <MenuItem state={menu.index} onClick={() => setMenu((prev) => ({...prev, index: !prev.index}))}>
          <SquareNumberIcon/>
        </MenuItem>
        <MenuItem state={menu.note} onClick={() => setMenu((prev) => ({...prev, note: !prev.note}))}>
          <NoteIcon/>
        </MenuItem>
      </div>
      <div onClick={() => {
        setIsOpen((prev) => !prev)
      }} className=" cursor-pointer">
        {
          isOpen? <DownIcon/> : <UpIcon/>
        }
      </div>
    </div>
  )
}

function MenuItem({children, state, onClick}: any) {
  return (
    <div className={cn("flex-center cursor-pointer text-gray-500", {"text-black": state})} onClick={onClick}>
      {children}
    </div>
  )
}

