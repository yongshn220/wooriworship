'use client'

import {Button} from "@/components/ui/button";
import React from "react";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {useRouter} from "next/navigation";
import { getPathCreateNotice } from "@/components/util/helper/routes";


export function NewNoticeButton() {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <div>
      <Button disabled={!teamId} className="bg-blue-500 hover:bg-blue-400" onClick={() => router.push(getPathCreateNotice(teamId))}>
        + Add Notice
      </Button>
    </div>
  )
}
