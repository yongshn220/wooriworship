"use client"
import {useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom} from "@/global-states/song-state";
import {SongListItem} from "@/app/board/[teamId]/song/_components/song-list-item";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {NewSongButton} from "@/app/board/[teamId]/song/_components/new-song-button";


export function SongListView() {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom)

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
                <p className="flex-[0.5]">Title</p>
                <p className="flex-[0.2] text-center">Key</p>
                <p className="hidden lg:flex justify-end lg:flex-[0.4]">Version</p>
                <p className="flex-[0.7] text-end">Tag</p>
                <p className="flex-[0.5] text-end">Last used date</p>
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
