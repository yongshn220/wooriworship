"use client"

import {WorshipPlanForm} from "@/app/board/[teamId]/plan/_components/worship-plan-form";
import {FormMode, Page} from "@/components/constants/enums";
import {PageInit} from "@/components/page/page-init";
import {useRecoilValue} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";


export default function EditPlanPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const worship = useRecoilValue(worshipAtom(worshipId))

  return (
    <div className="w-full h-full">
      <PageInit teamId={teamId} page={Page.EDIT_PLAN}/>
      <WorshipPlanForm mode={FormMode.EDIT} teamId={teamId} worship={worship}/>
    </div>
  )
}
