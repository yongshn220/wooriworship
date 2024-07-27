"use client"

import {
  getDayByTimestamp,
  getDayPassedFromTimestampShorten, isTimestampPast,
  timestampToDateStringFormatted
} from "@/components/helper/helper-functions";
import {getPathWorship} from "@/components/helper/routes";
import {useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {worshipAtom, worshipSongListAtom} from "@/global-states/worship-state";
import {useRouter} from "next/navigation";

interface Props {
  worshipId: string
}

export function WorshipCard({worshipId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const worship = useRecoilValue(worshipAtom(worshipId))
  const worshipSongListLoadable = useRecoilValueLoadable(worshipSongListAtom(worshipId))
  const router = useRouter()

  return (
    <div onClick={() => router.push(getPathWorship(teamId, worship.id))}>
      <div className="group md:aspect-[1/1] rounded-lg flex flex-col bg-white overflow-hidden cursor-pointer shadow p-4">
        <div className="flex flex-col pb-2 border-b">
          <div className="flex-between items-center w-full">
            <p className="text-sm text-gray-600">{timestampToDateStringFormatted(worship?.worship_date)}
              <span className="text-xs"> ({getDayByTimestamp(worship?.worship_date)})</span>
            </p>
            {
              isTimestampPast(worship?.worship_date) === false &&
              <p className="text-xs text-gray-500">{getDayPassedFromTimestampShorten(worship?.worship_date)}</p>
            }
          </div>
          <div className="font-semibold text-lg">{worship?.title === "" ? "No title" : worship.title}</div>
        </div>
        <div className="h-full flex flex-col justify-start gap-3 py-4">
          {
            worshipSongListLoadable.state === 'hasValue' &&
            worshipSongListLoadable.contents.map((song, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <p className="line-clamp-1 text-base sm:text-sm">{song?.title} <span className="text-sm text-gray-500">{song?.subtitle ? `(${song.subtitle})` : ""}</span></p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )

  // return (
  //   <div>
  //     <Link href={getPathWorship(teamId, worship.id)}>
  //       <div className={cn("group md:aspect-[1/1] border rounded-lg flex flex-col overflow-hidden cursor-pointer", {"bg-gray-400": isTimestampPast(worship?.worship_date)}, {"bg-[#95ABCC]" : !isTimestampPast(worship?.worship_date)})}>
  //         <div className="relative flex-1 flex-center flex-col text-white text-xs font-semibold gap-2 p-2 min-h-[150px]">
  //           <HoverOverlay/>
  //           { worshipSongListLoadable.state === 'loading' && <></> }
  //           { worshipSongListLoadable.state === 'hasError' && <></> }
  //           {
  //             worshipSongListLoadable.state === 'hasValue' &&
  //             worshipSongListLoadable.contents.map((song, i) => (
  //               <p key={i} className="line-clamp-1 text-base sm:text-sm">{song?.title}</p>
  //             ))
  //           }
  //         </div>
  //         <p className="p-4 bg-white line-clamp-1">
  //           {worship?.title !== ""? worship.title : "No title" }
  //         </p>
  //       </div>
  //     </Link>
  //     <p className="w-full text-center text-sm text-gray-600 mt-1">
  //       {timestampToDateString(worship?.worship_date)} <span className="text-xs">({getDayByTimestamp(worship?.worship_date)})</span>
  //     </p>
  //   </div>
  // )
}
