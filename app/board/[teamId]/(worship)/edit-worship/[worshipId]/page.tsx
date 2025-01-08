"use client"

import {FormMode, Page} from "@/components/constants/enums";
import {PageInit} from "@/components/util/page/page-init";
import {useRecoilValue} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {WorshipForm} from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-board-form/worship-form";


export default function EditPlanPage({params}: any) {
  const teamId = params.teamId
  const worshipId = params.worshipId
  const worship = useRecoilValue(worshipAtom(worshipId))

  return (
    <div className="w-full h-full">
      <PageInit teamId={teamId} page={Page.EDIT_WORSHIP}/>
      <WorshipForm mode={FormMode.EDIT} teamId={teamId} worship={worship}/>
    </div>
  )
}
