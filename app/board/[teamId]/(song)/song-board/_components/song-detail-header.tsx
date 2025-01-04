import React from "react";
import {useRecoilValue} from "recoil";
import {songAtom} from "@/global-states/song-state";
import {MenuButton} from "@/app/board/[teamId]/(song)/song-board/_components/menu-button";

interface Props {
  teamId: string
  songId: string
  readonly: boolean
}

export function SongDetailHeader({teamId, songId, readonly}: Props) {
  const song = useRecoilValue(songAtom(songId))

  return (
    <div>
      {
        !readonly &&
        <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <MenuButton teamId={teamId} songId={songId} songTitle={song?.title}/>
        </div>
      }
      <div className="text-center text-3xl font-bold">{song?.title}</div>
      {
        song?.subtitle &&
        <div className="text-center text-xl font-semibold">({song?.subtitle})</div>
      }
      <p className="text-center font-semibold text-gray-500">{song?.original.author}</p>
    </div>
  )
}
