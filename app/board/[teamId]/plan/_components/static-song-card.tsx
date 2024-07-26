"use client"

import {useSetRecoilState} from "recoil";
import {worshipBeginningSongIdAtom, worshipEndingSongIdAtom} from "@/app/board/[teamId]/plan/_components/status";
import {SongListItem, ViewMode} from "@/app/board/[teamId]/song/_components/song-list-item";
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {WorshipSpecialOrderType} from "@/components/constants/enums";
import {Checkbox} from "@/components/ui/checkbox";
import {useState} from "react";

interface Props {
  teamId: string
  specialOrderType: WorshipSpecialOrderType
  songId: string
}

export function StaticSongCard({teamId, specialOrderType, songId}: Props) {
  const setWorshipBeginningSongId = useSetRecoilState(worshipBeginningSongIdAtom)
  const setWorshipEndingSongId = useSetRecoilState(worshipEndingSongIdAtom)
  const [checked, setChecked] = useState<any>(true)

  function handleRemoveSong() {
    if (specialOrderType === WorshipSpecialOrderType.BEGINNING) {
      setWorshipBeginningSongId(null); return
    }
    if (specialOrderType === WorshipSpecialOrderType.ENDING) {
      setWorshipEndingSongId(null); return
    }
  }

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full border shadow-sm rounded-md p-2 gap-4 bg-white">
        <div className="flex-center border-b text-sm px-4 py-1 text-gray-500">
          {specialOrderType === WorshipSpecialOrderType.BEGINNING ? "Beginning Song" : "Ending"}
        </div>
        <SongDetailCardWrapper teamId={teamId} songId={songId}>
          <SongListItem songId={songId} viewMode={ViewMode.NONE}/>
        </SongDetailCardWrapper>
      </div>
      <div className="flex-between px-2 pt-1">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={checked} onCheckedChange={setChecked}/>
          <label
            htmlFor="terms"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500"
          >
            Set as default for future plan
          </label>
        </div>

        <div className="flex-end text-smnpx shadcn-ui@latest add dropdown-menu">
          <div className="text-gray-500 hover:text-gray-700 cursor-pointer text-sm"
               onClick={() => handleRemoveSong()}>remove
          </div>
        </div>
      </div>
    </div>
  )
}
