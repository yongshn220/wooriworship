import {WorshipCard} from "@/app/board/[teamId]/plan/_components/worship-card";
import {NewWorshipButton} from "@/app/board/[teamId]/plan/_components/new-worship-button";
import {useRecoilValueLoadable} from "recoil";
import Image from "next/image";
import * as React from "react";
import {currentTeamWorshipIdsAtom} from "@/global-states/worship-state";
import {Suspense} from "react";


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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 mt-10">
              {
                worshipIdsLoadable.contents.map((worshipId: string) => (
                  <Suspense key={worshipId} fallback={<div></div>}>
                    <WorshipCard worshipId={worshipId}/>
                  </Suspense>
                ))
              }
            </div>
              :
            <div className="w-full h-full flex-center flex-col gap-3">
              <Image
                alt="compose music image"
                src="/illustration/teamworkIllustration.svg"
                width={300}
                height={300}
              />
              <p className="text-3xl font-semibold">Worship Plan is empty</p>
              <p className="text-gray-500">Click &ldquo;Add Worship&rdquo; button to get started</p>
              <NewWorshipButton/>
            </div>
          }
        </div>
      )
  }
}
