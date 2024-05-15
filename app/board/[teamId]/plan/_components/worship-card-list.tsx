import {WorshipCard} from "@/app/board/[teamId]/plan/_components/worship-card";
import {toPlainObject} from "@/components/helper/helper-functions";
import {NewButton} from "@/app/board/[teamId]/plan/_components/new-button";
import {useRecoilValueLoadable} from "recoil";
import {currentTeamWorshipIdsAtom} from "@/app/board/[teamId]/plan/_states/worship-plan-states";


export function WorshipCardList() {
  const worshipIdsLoadable = useRecoilValueLoadable(currentTeamWorshipIdsAtom)

  switch (worshipIdsLoadable.state) {
    case 'loading': return <></>
    case 'hasError': throw worshipIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
          <NewButton/>
          {
            worshipIdsLoadable.contents.map((worshipId: string) => (
              <WorshipCard key={worshipId} worshipId={worshipId}/>
            ))
          }
        </div>
      )
  }
}
