"use client"

import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {WorshipCardList} from "@/app/board/[teamId]/plan/_components/worship-card-list";
import {Suspense} from "react";
import {PullToRefresh} from "@/components/functionality/pull-to-refresh";

export default function PlanPage({params}: any) {
  const teamId = params.teamId
  console.log("_---------Plan Page")
  return (
    <div className="w-full h-full flex flex-col">
      <PageInit teamId={teamId} page={Page.PLAN}/>
      <div className="flex-between">
        <p className="text-2xl font-semibold">
          Worship Plan
        </p>
      </div>
        <Suspense fallback={<></>}>
          <WorshipCardList teamId={teamId}/>
        </Suspense>
    </div>
  )
}
