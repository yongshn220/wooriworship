"use client"

import {SongListView} from "@/app/board/[teamId]/song/_components/song-list-view";
import {PullToRefresh} from "@/components/functionality/pull-to-refresh";

export default function SongLayout({params, children}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <PullToRefresh>
        {children}
        <div className="w-full h-full flex flex-col items-center">
          <SongListView teamId={teamId}/>
        </div>
      </PullToRefresh>
    </div>
  )
}

