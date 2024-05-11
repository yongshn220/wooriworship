'use client'

import {SongService} from "@/apis";
import {useRouter} from "next/navigation";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {toPlainObject} from "@/components/helper/helper-functions";
import {useEffect, useState} from "react";
import {Song} from "@/models/song";
import {getPathSong} from "@/components/helper/routes";


export default function SongDetailPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId
  const [song, setSong] = useState<Song>(null)
  const router = useRouter()

  useEffect(() => {
    SongService.getById(songId).then(_song => {
      setSong(_song as Song)
    })
  }, [songId])

  function onOpenChangeHandler(state: boolean) {
    if (!state) {
      router.push(getPathSong(teamId))
    }
  }

  if (!song) return <></>

  return (
     <SongDetailCard isOpen={true} setIsOpen={onOpenChangeHandler} song={toPlainObject(song)} editable={true} />
  )
}
