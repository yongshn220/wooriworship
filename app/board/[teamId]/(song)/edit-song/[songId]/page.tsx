"use client"

import {FormMode} from "@/components/constants/enums";
import {SongForm} from "@/components/elements/design/song/song-form/song-form";


export default function EditSongPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId

  return (
    <div className="w-full h-full">
      <SongForm mode={FormMode.EDIT} teamId={teamId} songId={songId}/>
    </div>
  )
}
