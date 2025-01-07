'use client'

import {useRouter} from "next/navigation";
import {getPathSong} from "@/components/helper/routes";
import {isMobile} from "@/components/helper/helper-functions";
import {SongDetailDrawer} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-card/song-detail-drawer";
import {SongDetailCard} from "@/app/board/[teamId]/(song)/song-board/_components/song-detail-card/song-detail-card";

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
