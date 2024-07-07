"use client"

import {Page} from "@/components/constants/enums";
import {PageInit} from "@/components/page/page-init";
import {WorshipPlanPreview} from "@/app/board/[teamId]/_components/worship-plan-preview";
import {NoticePreview} from "@/app/board/[teamId]/_components/notice-preview";

export default function BoardHomePage({params}) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full flex-center">
      <div className="flex flex-col w-full h-full gap-6">
        <NoticePreview/>
        <WorshipPlanPreview teamId={teamId}/>
      </div>
    </div>
  )
}
