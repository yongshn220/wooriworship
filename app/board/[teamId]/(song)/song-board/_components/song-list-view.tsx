"use client"
import {useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom} from "@/global-states/song-state";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {SongDetailCardWrapper} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-card-wrapper";
import {SongListItem} from "@/app/board/[teamId]/(song)/song-board/_components/song-list-item";
import {NewSongButton} from "@/app/board/[teamId]/(song)/song-board/_components/new-song-button";


interface Props {
  teamId: string
}

export function SongListView({teamId}: Props) {
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
                    <SongDetailCardWrapper teamId={teamId} songId={songId}>
                      <SongListItem songId={songId}/>
                    </SongDetailCardWrapper>
                    <Separator/>
                  </div>
                ))
              }
            </div>
              :
            <div className="w-full h-full flex-center flex-col gap-4">
              <Image
                alt="compose music image"
                src="/illustration/happyMusic.svg"
                width={300}
                height={300}
              />
              <p className="text-3xl font-semibold">Song Board is empty</p>
              <p className="text-gray-500">Click &ldquo;Add Song&rdquo; button to get started</p>
              <NewSongButton/>
            </div>
          }
        </div>
      )
  }
}
