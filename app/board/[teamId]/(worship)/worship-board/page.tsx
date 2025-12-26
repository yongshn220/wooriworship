"use client"

import { Suspense } from "react";
import { WorshipCardList } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-card-list";
import { WorshipListSkeleton } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-list-skeleton";

export default function PlanPage({ params }: any) {
  const teamId = params.teamId
  console.log("_---------Plan Page")
  return (
    <div className="w-full h-full flex flex-col">
      <Suspense fallback={<WorshipListSkeleton />}>
        <WorshipCardList teamId={teamId} />
      </Suspense>
    </div>
  )
}
