"use client"

import {NewButton} from "@/app/board/[teamId]/plan/_components/new-button";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {WorshipService} from "@/apis";
import {WorshipCard} from "@/app/board/[teamId]/plan/_components/worship-card";
import {toPlainObject} from "@/components/helper/helper-functions";
import {useEffect, useState} from "react";


export default function PlanPage({params}: any) {
  const teamId = params.teamId
  const [worshipList, setWorshipList] = useState([])

  useEffect(() => {
    WorshipService.getTeamWorship(teamId).then((_worshipList) => {
      setWorshipList(_worshipList)
    })
  })

  return (
    <div>
      <PageInit teamId={teamId} page={Page.PLAN}/>
      <div className="flex-between mb-4">
        <p className="text-2xl font-semibold pb-4">
          Worship Plan
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
        <NewButton/>
        {
          worshipList.map((worship: any, i: number) => (
            <WorshipCard key={i} teamId={teamId} worship={toPlainObject(worship)}/>
          ))
        }
      </div>
    </div>
  )
}
