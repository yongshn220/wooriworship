"use client"

import {FormMode} from "@/components/constants/enums";
import {SongForm} from "@/components/elements/design/song/song-form/song-form";
import {SongErrorBoundary} from "@/app/board/[teamId]/(song)/song-board/_components/song-error-boundary";


export default function EditSongPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId

  return (
    <div className="w-full h-full">
      <SongErrorBoundary fallbackMessage="Failed to load song form. Please try again.">
        <SongForm mode={FormMode.EDIT} teamId={teamId} songId={songId}/>
      </SongErrorBoundary>
    </div>
  )
}
