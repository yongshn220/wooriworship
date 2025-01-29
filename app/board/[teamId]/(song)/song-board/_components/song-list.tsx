"use client"
import {useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom, songIdsAtom} from "@/global-states/song-state";
import {Separator} from "@/components/ui/separator";
import * as React from "react";
import {SongDetailDialogTrigger} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger";
import {SongHeaderDefault} from "@/components/elements/design/song/song-header/default/song-header-default";
import {EmptySongBoardPage} from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/empty-song-board-page";


interface Props {
  teamId: string
}

export function SongList({teamId}: Props) {
  // const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom(teamId))
  const songIds = useRecoilValue(songIdsAtom(teamId))

  if (!songIds || songIds?.length <= 0) {
    return (<EmptySongBoardPage/>)
  }

  return (
    <div className="w-full h-full">
        <div>
          <div className="hidden md:flex text-sm text-gray-600 px-6 mt-10 font-semibold">
            <p className="flex-1">Title</p>
            <p className="hidden lg:flex flex-[0.4] justify-start border-l border-gray-300 pl-2">Version</p>
            <div className="hidden sm:flex justify-start sm:flex-1 text-start border-l border-gray-300 pl-2">Tag</div>
            <p className="flex justify-end lg:flex-[0.5] pl-2">Used on</p>
          </div>
        </div>
        <div className="flex-center flex-col mx-2 box-border">
          {
            songIds.map((songId) => (
              <div key={songId} className="w-full">
                <SongDetailDialogTrigger teamId={teamId} songId={songId}>
                  {/*<SongHeaderDefault songId={songId}/>*/}
                  123o
                </SongDetailDialogTrigger>
                <Separator/>
              </div>
            ))
          }
        </div>
    </div>
  )
}
