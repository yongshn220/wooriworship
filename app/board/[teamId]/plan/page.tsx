"use client"

import {WorshipCardList} from "@/app/board/[teamId]/plan/_components/worship-card-list";
import {Suspense} from "react";

export default function PlanPage({params}: any) {
  const teamId = params.teamId
  console.log("_---------Plan Page")
  return (
    <div className="w-full h-full flex flex-col">
      <Suspense fallback={<></>}>
        <WorshipCardList teamId={teamId}/>
      </Suspense>
    </div>
  )
}
