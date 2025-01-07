"use client"

import {FormMode, Page} from "@/components/constants/enums";
import {PageInit} from "@/components/page/page-init";
import {SongForm} from "@/app/board/[teamId]/(song)/song-board/_components/song-form/song-form";


export default function CreateSongPage({params}: any) {
  const teamId = params.teamId

  return (
    <div className="w-full h-full">
      <PageInit teamId={teamId} page={Page.CREATE_SONG}/>
      <SongForm mode={FormMode.CREATE} teamId={teamId} songId={null}/>
    </div>
  )
}
