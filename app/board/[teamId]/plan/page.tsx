"use client"

import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {WorshipCardList} from "@/app/board/[teamId]/plan/_components/worship-card-list";


export default function PlanPage({params}: any) {
  const teamId = params.teamId

  return (
    <div>
      <PageInit teamId={teamId} page={Page.PLAN}/>
      <div className="flex-between mb-4">
        <p className="text-2xl font-semibold pb-4">
          Worship Plan
        </p>
      </div>
      <WorshipCardList/>
    </div>
  )
}
