import {useRecoilValue} from "recoil";
import {worshipMenuAtom} from "@/app/worship/[id]/_states/menu";
import {cn} from "@/lib/utils";
import * as React from "react";


export function WorshipIndexIndicator() {
  const menu = useRecoilValue(worshipMenuAtom)

  return (
    <div className={cn("absolute left-5 gap-4", {"flex-center flex-col": menu.index}, {"hidden": !menu.index})}>
      <div className="w-3 h-3 bg-gray-300 rounded-full"/>
      <div className="w-3 h-3 bg-gray-300 rounded-full"/>
      <div className="w-3 h-3 bg-gray-300 rounded-full"/>
      <div className="flex-center w-6 h-6 bg-gray-500 rounded-lg font-semibold text-white">4</div>
    </div>
  )
}
