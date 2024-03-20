'use client'

import NoteIcon from "@/public/icons/noteIcon.svg";
import UpIcon from "@/public/icons/upIcon.svg";
import DownIcon from "@/public/icons/downIcon.svg";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {useRecoilState} from "recoil";
import {worshipNoteAtom} from "@/app/worship/[id]/_states/menu";

export function WorshipViewMenu() {
  const [isOpen, setIsOpen] = useState(true)
  const [note, setNote] = useRecoilState(worshipNoteAtom)

  return (
    <div className="absolute flex-center flex-col w-10 gap-y-4 right-5 bottom-10">
      <div className={cn("space-y-4", {"hidden": !isOpen})}>
        <div className={cn("cursor-pointer text-gray-500", {"text-black": note})} onClick={() => setNote((prev) => !prev)}>
          <NoteIcon/>
        </div>
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


