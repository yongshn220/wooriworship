"use client"

import {SongHeader} from "@/models/worship";
import {SongService} from "@/apis";
import {Song} from "@/models/song";
import LinkIcon from '@/public/icons/linkIcon.svg'
import {SongDetailCardWrapper} from "@/app/worship/[teamId]/[worshipId]/_components/song-detail-card-wrapper";
import {useEffect, useState} from "react";

interface Props {
  songHeader: SongHeader
  index: number
}

export function SongItem({songHeader, index}: Props) {
  const [song, setSong] = useState<Song>(null)

  useEffect(() => {
    if (songHeader?.id) {
      SongService.getById(songHeader?.id).then((_song) => {
        if (_song)
          setSong(_song as Song)
      })
    }
  }, [songHeader?.id])

  if (!song) return <></>

  return (
    <SongDetailCardWrapper song={song}>
      <div className="flex-between w-full h-12 p-2 px-4 rounded-lg cursor-pointer hover:bg-gray-100">
        <div className="flex-between gap-4">
          <div className="flex-center rounded-full aspect-square text-gray-500 ">
            {index}.
          </div>
          <div className="flex-center gap-4">
            <p className="font-semibold">{song?.title} {song?.version !== ""? `- ${song.version}` : ""}</p>
            <p className="text-sm text-gray-500">{song?.original.author}</p>
          </div>
        </div>
        <div className="flex-center gap-4">
          <div>{song?.key === ""? "" : `${song?.key} Key`}</div>
          <div className="cursor-pointer hover:bg-white/[0.2] rounded-full p-2">
            <LinkIcon/>
          </div>
        </div>
      </div>
    </SongDetailCardWrapper>
  )
}
