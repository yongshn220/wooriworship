import {useRecoilValue, useSetRecoilState} from "recoil";
import {
  worshipIndexAtom,
  worshipIndexChangeEventAtom,
  worshipLiveOptionsAtom
} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {cn} from "@/lib/utils";
import * as React from "react";


export function WorshipIndexIndicator() {
  const menu = useRecoilValue(worshipLiveOptionsAtom)
  const index = useRecoilValue(worshipIndexAtom)
  const setWorshipIndexChangeEvent = useSetRecoilState(worshipIndexChangeEventAtom)

  return (
    <div className={cn("absolute left-5 gap-y-2", {"flex-center flex-col": menu.showSongNumber}, {"hidden": !menu.showSongNumber})}>
      {
        Array.from(Array(index.total)).map((_, i) => (
          (i !== index.current) ?
            <div key={i} className="group w-6 h-6 flex-center cursor-pointer" onClick={() => setWorshipIndexChangeEvent(i)}>
              <div className="w-3 h-3 bg-gray-300 rounded-full group-hover:bg-blue-300"/>
            </div>
            :
            <div key={i} className="flex-center w-6 h-6 bg-blue-500 rounded-lg font-semibold text-white">{i + 1}</div>
        ))
      }
    </div>
  )
}
