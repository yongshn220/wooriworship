
import {SongService} from "@/apis";
import {redirect} from "next/navigation";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {toPlainObject} from "@/components/helper/helper-functions";


export default async function SongDetailPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId

  const song = await SongService.getById(songId)

  async function onOpenChangeHandler(state: boolean) {
    "use server"

    if (!state) {
      redirect(`/board/${teamId}/song`)
    }
  }

  return (
     <SongDetailCard isOpen={true} setIsOpen={onOpenChangeHandler} song={toPlainObject(song)} editable={true} />
  )
}
