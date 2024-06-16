"use client"

import {SongHeader} from "@/models/worship";
import LinkIcon from '@/public/icons/linkIcon.svg'
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";

interface Props {
  teamId: string
  songHeader: SongHeader
  index: number
}

export function SongItem({teamId, songHeader, index}: Props) {
  const song = useRecoilValue(songAtom(songHeader?.id))

  if (!song) return <></>

  return (
    <SongDetailCardWrapper teamId={teamId} song={song}>
      <div className="flex-between w-full h-12 p-2 px-4 rounded-lg cursor-pointer hover:bg-gray-100">
        <div className="flex-between gap-4">
          <div className="hidden sm:flex  rounded-full aspect-square text-gray-500 ">
            {index}.
          </div>
          <div className="flex-center gap-4">
            <p className="font-semibold">{song?.title} {song?.version !== ""? `- ${song.version}` : ""}</p>
            <p className="hidden sm:flex text-sm text-gray-500">{song?.original.author}</p>
          </div>
        </div>
        <div className="flex-center gap-4">
          <div>{song?.key === ""? "" : `${song?.key}`}</div>
        </div>
      </div>
    </SongDetailCardWrapper>
  )
}
