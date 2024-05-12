"use client"

import {HoverOverlay} from "@/components/hover-overlay";
import Link from "next/link";
import {Worship} from "@/models/worship";
import {SongService} from "@/apis";
import {timestampToDateString} from "@/components/helper/helper-functions";
import {getPathWorship} from "@/components/helper/routes";
import {useEffect, useState} from "react";

interface Props {
  teamId: string
  worship: Worship
}
export function WorshipCard({teamId, worship}: Props) {
  const [songList, setSongList] = useState([])

  useEffect(() => {
    let songsPromise = worship.songs.map(song => SongService.getById(song.id))
    Promise.all(songsPromise).then(_songList => {
      setSongList(_songList)
    })
  }, [worship.songs])


  return (
    <div>
      <Link href={getPathWorship(teamId, worship.id)}>
        <div className="group aspect-[1/1] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC] cursor-pointer">
          <div className="relative flex-1 flex-center flex-col text-white text-xs font-semibold gap-2 p-2">
            <HoverOverlay/>
            {
              songList.map((song, i) => (
                <p key={i} className="line-clamp-1">{song?.title}</p>
              ))
            }
          </div>
          <p className="p-4 bg-white text-xs line-clamp-1">
            {worship?.title}
          </p>
        </div>
      </Link>
      <p className="w-full text-center text-sm text-gray-600 mt-1">
        {timestampToDateString(worship?.worship_date)} <span className="text-xs">(Mon)</span>
      </p>
    </div>
  )
}
