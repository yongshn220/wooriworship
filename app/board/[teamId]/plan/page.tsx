"use client"

import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {WorshipCardList} from "@/app/board/[teamId]/plan/_components/worship-card-list";
import {auth} from "@/firebase";
import {useRecoilValue} from "recoil";
import {userAtom} from "@/global-states/userState";


export default function PlanPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex flex-col">
      <PageInit teamId={teamId} page={Page.PLAN}/>
      <div className="flex-between">
        <p className="text-2xl font-semibold">
          Worship Plan
        </p>
      </div>
      <WorshipCardList teamId={teamId}/>
    </div>
  )
}
