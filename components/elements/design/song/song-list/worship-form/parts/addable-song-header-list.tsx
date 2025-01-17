"use client"
import {useRecoilState, useRecoilValue, useRecoilValueLoadable} from "recoil";
import {currentTeamSongIdsAtom, songAtom} from "@/global-states/song-state";
import {Separator} from "@/components/ui/separator";
import Image from "next/image";
import * as React from "react";
import {useState} from "react";
import {
  AddableSongDetailDialogTrigger
} from "@/components/elements/design/song/song-detail-card/worship-form/addable-song-detail-dialog-trigger";
import {SongHeaderDefault} from "@/components/elements/design/song/song-header/default/song-header-default";
import {selectedWorshipSongHeaderListAtom} from "@/app/board/[teamId]/(worship)/worship-board/_components/status";
import {
  AddableSongHeaderDefault
} from "@/components/elements/design/song/song-header/worship-form/addable-song-header-default";

interface Props {
  teamId: string
}

export function AddableSongHeaderList({teamId}: Props) {
  const songIdsLoadable = useRecoilValueLoadable(currentTeamSongIdsAtom(teamId))

  switch (songIdsLoadable.state) {
    case 'loading': return <></>;
    case 'hasError': throw songIdsLoadable.contents
    case 'hasValue':
      return (
        <div className="w-full h-full">
          {
            (songIdsLoadable.contents?.length > 0) &&
            <div className="w-full pl-5">
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
            <div className="w-full box-border">
              {
                songIdsLoadable.contents.map((songId) => (
                  <div key={songId} className="w-full">
                    <AddableSongHeaderDefault teamId={teamId} songId={songId}/>
                    <Separator/>
                  </div>
                ))
              }
            </div>
              :
            <div className="w-full h-full flex-center flex-col gap-4 py-10">
              <Image
                alt="compose music image"
                src="/illustration/happyMusic.svg"
                width={200}
                height={200}
              />
              <p className="text-xl font-semibold">No available songs!</p>
              <p className="text-muted-foreground">Please add songs in the song board.</p>
            </div>
          }
        </div>
      )
  }
}

