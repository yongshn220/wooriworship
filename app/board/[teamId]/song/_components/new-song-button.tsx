'use client'

import {Button} from "@/components/ui/button";
import React from "react";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import {getPathCreateSong} from "@/components/helper/routes";

export function NewSongButton() {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <div>
      <Button disabled={!teamId} className="bg-blue-500 hover:bg-blue-400" onClick={() => router.push(getPathCreateSong(teamId))}>
        + Add Song
      </Button>
    </div>
  )
}
