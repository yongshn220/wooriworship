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
  const [songWrapper, setSongWrapper] = useState<{ song: Song, status: DataFetchStatus }>({
    song: null,
    status: DataFetchStatus.PROCESSING
  })
  const router = useRouter()

  useEffect(() => {
    SongService.getById(songId).then(_song => {
      setSongWrapper({
        song: _song as Song,
        status: (_song)? DataFetchStatus.VALID : DataFetchStatus.INVALID
      })
    })
  }, [songId])

  function onOpenChangeHandler(state: boolean) {
    if (!state) {
      router.push(getPathSong(teamId))
    }
  }

  if (songWrapper.status === DataFetchStatus.PROCESSING) {
    return <></>
  }
  if (songWrapper.status === DataFetchStatus.INVALID) {
    toast({
      title: `Invalid song`,
      description: "Selected song is deleted or not exist."
    })
    router.push(getPathSong(teamId))
    return <></>
  }

  return (
     <SongDetailCard isOpen={true} setIsOpen={onOpenChangeHandler} song={toPlainObject(songWrapper.song)} readOnly={false} />
  )
}
