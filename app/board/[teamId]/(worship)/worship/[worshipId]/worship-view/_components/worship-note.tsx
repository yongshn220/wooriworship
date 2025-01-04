import * as React from "react";
import {useRecoilValue} from "recoil";
import {cn} from "@/lib/utils";
import {worshipLiveOptionsAtom} from "@/app/board/[teamId]/(worship)/worship/[worshipId]/_states/worship-detail-states";

interface Props {
  description: string
}

export function WorshipNote({description}: Props) {
  const menu = useRecoilValue(worshipLiveOptionsAtom)

  return (
    <div className={cn("w-full p-2 px-4 text-sm whitespace-pre-wrap", {"hidden": !menu.showSongNote})}>
      {description}
    </div>
  )
}
