import {useRecoilValueLoadable} from "recoil";
import * as React from "react";
import {currentTeamWorshipIdsAtom} from "@/global-states/worship-state";
import {Suspense} from "react";
import {WorshipCard} from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-card";
import {EmptyWorshipBoardPage} from "@/app/board/[teamId]/(worship)/worship-board/_components/empty-worship-board-page/empty-worship-board-page";


interface Props {
  teamId: string
}

export function WorshipCardList({teamId}: Props) {
  const worshipIdsLoadable = useRecoilValueLoadable(currentTeamWorshipIdsAtom(teamId))

  switch (worshipIdsLoadable.state) {
    case 'loading': return <></>
    case 'hasError': throw worshipIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full h-full">
          {
            (worshipIdsLoadable.contents?.length > 0) ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 grid-flow-row-dense grid-rows-[auto]">
              {
                worshipIdsLoadable.contents.map((worshipId: string) => (
                  <Suspense key={worshipId} fallback={<div></div>}>
                    <WorshipCard worshipId={worshipId}/>
                  </Suspense>
                ))
              }
            </div>
              :
            <EmptyWorshipBoardPage/>
          }
        </div>
      )
  }
}
