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
  const router = useRouter()

  function onOpenChangeHandler(isOpen: boolean) {
    if (!isOpen) {
      router.push(getPathSongDetail(teamId, songId))
    }
  }

  return (
    <SongForm mode={Mode.EDIT} isOpen={true} setIsOpen={onOpenChangeHandler} songId={songId}/>
  )
}
