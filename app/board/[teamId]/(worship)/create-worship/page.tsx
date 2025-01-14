"use client"

import {FormMode} from "@/components/constants/enums";
import {WorshipForm} from "@/components/elements/design/worship/worship-form/worship-form";


export default function CreatePlanPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <WorshipForm mode={FormMode.CREATE} teamId={teamId} worship={null}/>
    </div>
  )
}
