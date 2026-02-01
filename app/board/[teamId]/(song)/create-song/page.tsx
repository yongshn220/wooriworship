"use client"

import {FormMode} from "@/components/constants/enums";
import {SongForm} from "@/components/elements/design/song/song-form/song-form";
import {SongErrorBoundary} from "@/app/board/[teamId]/(song)/song-board/_components/song-error-boundary";


export default function CreateSongPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <SongErrorBoundary fallbackMessage="Failed to load song form. Please try again.">
        <SongForm mode={FormMode.CREATE} teamId={teamId} songId={null}/>
      </SongErrorBoundary>
    </div>
  )
}
