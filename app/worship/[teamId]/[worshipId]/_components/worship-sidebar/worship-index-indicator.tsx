import {useRecoilValue} from "recoil";
import {worshipIndexAtom, worshipMenuAtom} from "@/app/worship/[teamId]/[worshipId]/_states/menu";
import {cn} from "@/lib/utils";
import * as React from "react";


export function WorshipIndexIndicator() {
  const menu = useRecoilValue(worshipMenuAtom)
  const index = useRecoilValue(worshipIndexAtom)
  console.log(index)

  return (
    <div className={cn("absolute left-5 gap-4", {"flex-center flex-col": menu.index}, {"hidden": !menu.index})}>
      {
        Array.from(Array(index.total)).map((_, i) => (
          (i !== index.current)
            ? <div key={i} className="w-3 h-3 bg-gray-300 rounded-full"/>
            : <div key={i} className="flex-center w-6 h-6 bg-gray-500 rounded-lg font-semibold text-white">{i + 1}</div>
        ))
      }
    </div>
  )
}
