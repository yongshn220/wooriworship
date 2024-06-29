"use client"

import {WorshipPlanForm} from "@/app/board/[teamId]/plan/_components/worship-plan-form";
import {FormMode, Page} from "@/components/constants/enums";
import {PageInit} from "@/components/page/page-init";


export default function CreatePlanPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <PageInit teamId={teamId} page={Page.CREATE_PLAN}/>
      <WorshipPlanForm mode={FormMode.CREATE} teamId={teamId} worship={null}/>
    </div>
  )
}
