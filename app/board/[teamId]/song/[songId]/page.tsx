'use client'

import {SongService} from "@/apis";
import {useRouter} from "next/navigation";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {toPlainObject} from "@/components/helper/helper-functions";
import {useEffect, useState} from "react";
import {Song} from "@/models/song";
import {getPathSong} from "@/components/helper/routes";
import {DataFetchStatus} from "@/components/constants/enums";
import {toast} from "@/components/ui/use-toast";


export default function SongDetailPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId
  const router = useRouter()

  function onOpenChangeHandler(state: boolean) {
    if (!state) {
      router.push(getPathSong(teamId))
    }
  }

  return (
     <SongDetailCard teamId={teamId} isOpen={true} setIsOpen={onOpenChangeHandler} songId={songId} readOnly={false} />
  )
}
