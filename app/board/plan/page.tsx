"use client"

import {WorshipCard} from "@/app/board/_components/worship-plan/worship-card";
import {NewButton} from "@/app/board/_components/worship-plan/new-button";
import {PageInit} from "@/components/page/page-init";
import {Routes} from "@/components/constants/enums";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentUserAtom} from "@/global-states/userState";
import {useEffect, useState} from "react";
import {currentTeamAtom} from "@/global-states/teamState";


export default function PlanPage() {
  const currentUser = useRecoilValue(currentUserAtom)
  const currentTeam = useRecoilValue(currentTeamAtom)
  const [worships, setWorships] = useState([])

  useEffect(() => {
    // todo: firebase api call
    const _worships = []
    setWorships([])
  }, [])

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
        {
          worships.map((worship: any, i: number) => (
            <WorshipCard key={i} />
          ))
        }
      </div>
    </div>
  )
}
