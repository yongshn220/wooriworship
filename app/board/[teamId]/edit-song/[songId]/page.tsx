"use client"

import {FormMode, Page} from "@/components/constants/enums";
import {PageInit} from "@/components/page/page-init";
import {useRecoilValue} from "recoil";
import {worshipAtom} from "@/global-states/worship-state";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";


export default function EditSongPage({params}: any) {
  const teamId = params.teamId
  const songId = params.songId

  return (
    <div className="w-full h-full">
      <PageInit teamId={teamId} page={Page.EDIT_SONG}/>
      <SongForm mode={FormMode.EDIT} teamId={teamId} songId={songId}/>
    </div>
  )
}
