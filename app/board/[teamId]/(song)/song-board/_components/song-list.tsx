"use client"
import {useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom} from "@/global-states/song-state";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {SongDetailDialogTrigger} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger";
import {SongHeaderDefault} from "@/components/elements/design/song/song-header/default/song-header-default";
import {NewSongButton} from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/new-song-button";
import {
  EmptySongBoardPage
} from "@/app/board/[teamId]/(song)/song-board/_components/empty-song-board-page/empty-song-board-page";


interface Props {
  teamId: string
}

export function SongList({teamId}: Props) {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom(teamId))

  switch (songIdsLoadable.state) {
    case 'loading': return <></>;
    case 'hasError': throw songIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full h-full">
          {
            (songIdsLoadable.contents?.length > 0) &&
            <div>
              <div className="hidden md:flex text-sm text-gray-600 px-6 mt-10 font-semibold">
                <p className="flex-1">Title</p>
                <p className="hidden lg:flex flex-[0.4] justify-start border-l border-gray-300 pl-2">Version</p>
                <div className="hidden sm:flex justify-start sm:flex-1 text-start border-l border-gray-300 pl-2">Tag</div>
                <p className="flex justify-end lg:flex-[0.5] pl-2">Used on</p>
              </div>
            </div>
          }
          {
            (songIdsLoadable.contents?.length > 0) ?
            <div className="flex-center flex-col mx-2 box-border">
              {
                songIdsLoadable.contents.map((songId) => (
                  <div key={songId} className="w-full">
                    <SongDetailDialogTrigger teamId={teamId} songId={songId}>
                      <SongHeaderDefault songId={songId}/>
                    </SongDetailDialogTrigger>
                    <Separator/>
                  </div>
                ))
              }
            </div>
              :
            <EmptySongBoardPage/>
          }
        </div>
      )
  }
}
