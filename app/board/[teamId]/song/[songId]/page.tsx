'use client'

import {useRouter} from "next/navigation";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {getPathSong} from "@/components/helper/routes";
import {SongDetailDrawer} from "@/app/board/[teamId]/song/_components/song-detail-drawer";
import {isMobile} from "@/components/helper/helper-functions";


export default function SongDetailPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId
  const router = useRouter()

  function onOpenChangeHandler(state: boolean) {
    if (!state) {
      router.push(getPathSong(teamId))
    }
  }

  if (isMobile()) {
    return (
      <SongDetailDrawer teamId={teamId} isOpen={true} setIsOpen={onOpenChangeHandler} songId={songId} readOnly={false} />
    )
  }

  return (
    <SongDetailCard teamId={teamId} isOpen={true} setIsOpen={onOpenChangeHandler} songId={songId} readOnly={false} />
  )
}
