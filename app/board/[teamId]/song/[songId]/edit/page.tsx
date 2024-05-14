"use client"

import {Mode} from "@/components/constants/enums";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {Song} from "@/models/song";
import {SongService} from "@/apis";
import {redirect, useRouter} from 'next/navigation'
import {toPlainObject} from "@/components/helper/helper-functions";
import {getPathSongDetail} from "@/components/helper/routes";
import {useEffect, useState} from "react";


export default function SongEditPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId
  const [song, setSong] = useState<Song>(null)
  const router = useRouter()

  useEffect(() => {
    SongService.getById(songId).then(_song => {
      setSong(_song as Song)
    })
  }, [songId])

  function onOpenChangeHandler(isOpen: boolean) {
    if (!isOpen) {
      router.push(getPathSongDetail(teamId, songId))
    }
  }

  if (!song) return <></>

  return (
    <SongForm mode={Mode.EDIT} isOpen={true} setIsOpen={onOpenChangeHandler} song={toPlainObject(song)}/>
  )
}
