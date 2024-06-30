'use client'

import {useRouter} from "next/navigation";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {getPathSong} from "@/components/helper/routes";


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
