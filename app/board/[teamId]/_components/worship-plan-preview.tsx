import {useRecoilValueLoadable} from "recoil";
import {currentTeamWorshipIdsAtom} from "@/global-states/worship-state";
import {Suspense} from "react";
import {WorshipCard} from "@/app/board/[teamId]/plan/_components/worship-card";
import * as React from "react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {getPathPlan} from "@/components/helper/routes";


interface Props {
  teamId: string
}

export function WorshipPlanPreview({teamId}: Props) {
  const router = useRouter()

  return (
    <div className="bg-white border p-4 rounded-xl">
      <p className="text-xl font-semibold pb-4">Recent Worship Plan</p>
      <div className="w-full h-full">
        <RecentWorshipPlanList teamId={teamId}/>

        <div className="w-full flex-center">
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-none" onClick={() => router.push(getPathPlan(teamId))}>View All</Button>
        </div>
      </div>
    </div>
  )
}

function RecentWorshipPlanList({teamId}: Props) {
  const worshipIdsLoadable = useRecoilValueLoadable(currentTeamWorshipIdsAtom(teamId))

  switch (worshipIdsLoadable.state) {
    case 'loading': return <></>
    case 'hasError': throw worshipIdsLoadable.contents
    case 'hasValue': {
      if (worshipIdsLoadable.contents?.length > 0) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {
              worshipIdsLoadable.contents.slice(0,4).map((worshipId: string) => (
                <Suspense key={worshipId} fallback={<div></div>}>
                  <WorshipCard worshipId={worshipId}/>
                </Suspense>
              ))
            }
          </div>
        )
      }
    }
  }
}
