

import {WorshipCard} from "@/app/board/_components/worship-plan/worship-card";
import {NewButton} from "@/app/board/_components/worship-plan/new-button";
import {PageInit} from "@/components/page/page-init";
import {Routes} from "@/components/constants/enums";


export default function PlanPage() {
  return (
    <div>
      <PageInit route={Routes.PLAN}/>
      <div className="flex-between mb-4">
        <p className="text-2xl font-semibold pb-4">
          Worship Plan
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
        <NewButton/>
        <WorshipCard/>
        <WorshipCard/>
        <WorshipCard/>
        <WorshipCard/>
        <WorshipCard/>
        <WorshipCard/>
      </div>
    </div>
  )
}
