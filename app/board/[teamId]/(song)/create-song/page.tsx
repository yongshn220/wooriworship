"use client"

import {FormMode} from "@/components/constants/enums";
import {SongForm} from "@/components/elements/design/song/song-form/song-form";


export default function CreateSongPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <SongForm mode={FormMode.CREATE} teamId={teamId} songId={null}/>
    </div>
  )
}
