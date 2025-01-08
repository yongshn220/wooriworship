"use client"

import {FormMode, Page} from "@/components/constants/enums";
import {PageInit} from "@/components/util/page/page-init";
import {WorshipForm} from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-board-form/worship-form";


export default function CreatePlanPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <PageInit teamId={teamId} page={Page.CREATE_WORSHIP}/>
      <WorshipForm mode={FormMode.CREATE} teamId={teamId} worship={null}/>
    </div>
  )
}
