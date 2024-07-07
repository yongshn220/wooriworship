"use client"

import {WorshipPlanPreview} from "@/app/board/[teamId]/_components/worship-plan-preview";
import {NoticePreview} from "@/app/board/[teamId]/_components/notice-preview";

export default function BoardHomePage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex-center">
      <div className="flex flex-col w-full h-full gap-6">
        <NoticePreview teamId={teamId}/>
        <WorshipPlanPreview teamId={teamId}/>
      </div>
    </div>
  )
}
