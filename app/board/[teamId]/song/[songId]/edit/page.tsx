import {Mode} from "@/components/constants/enums";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {Song} from "@/models/song";
import {SongService} from "@/apis";
import { redirect } from 'next/navigation'
import {toPlainObject} from "@/components/helper/helper-functions";


export default async  function SongEditPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId

  const song = await SongService.getById(songId) as Song

  async function onOpenChangeHandler(state: boolean) {
    "use server"

    if (!state) {
      redirect(`/board/${teamId}/song/${songId}`)
    }
  }

  return (
    <SongForm mode={Mode.EDIT} isOpen={true} setIsOpen={onOpenChangeHandler} song={toPlainObject(song)}/>
  )
}
