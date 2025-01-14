'use client'

import {useRouter} from "next/navigation";
import {getPathSong} from "@/components/util/helper/routes";
import {SongDetailDialog} from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";

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
    <SongDetailDialog teamId={teamId} isOpen={true} setIsOpen={onOpenChangeHandler} songId={songId} readOnly={false} />
  )
}
