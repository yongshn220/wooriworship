"use client"

import {Mode} from "@/components/constants/enums";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {useRouter} from 'next/navigation'
import {getPathSongDetail} from "@/components/helper/routes";


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
