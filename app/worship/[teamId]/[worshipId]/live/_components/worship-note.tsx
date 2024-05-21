import * as React from "react";
import {useRecoilValue} from "recoil";
import {worshipMenuAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {cn} from "@/lib/utils";

interface Props {
  description: string
}

export function WorshipNote({description}: Props) {
  const menu = useRecoilValue(worshipMenuAtom)

  return (
    <div className={cn("w-full p-2 px-4 text-sm whitespace-pre-wrap", {"hidden": !menu.showSongNote})}>
      {description}
    </div>
  )
}
