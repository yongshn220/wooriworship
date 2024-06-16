"use client"
import {useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom} from "@/global-states/song-state";
import {SongListItem} from "@/app/board/[teamId]/song/_components/song-list-item";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {NewSongButton} from "@/app/board/[teamId]/song/_components/new-song-button";

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
              <div className="flex text-sm text-gray-500 px-6 mt-10">
                <p className="flex-1">Title</p>
                <p className="hidden lg:flex flex-[0.4] justify-end">Version</p>
                <div className="hidden sm:flex justify-end sm:flex-1 text-end">Tag</div>
                <p className="flex justify-end flex-1 lg:flex-[0.5]">Last used date</p>
              </div>
              <Separator/>
            </div>
          }
          {
            (songIdsLoadable.contents?.length > 0) ?
            <div className="flex-center flex-col mx-2 box-border">
              {
                songIdsLoadable.contents.map((songId) => (
                  <div key={songId} className="w-full">
                    <SongListItem songId={songId}/>
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
