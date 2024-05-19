import {NewSongButton} from "@/app/board/[teamId]/song/_components/new-song-button";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import {SongGridView} from "@/app/board/[teamId]/song/_components/song-grid-view";
import {SongListView} from "@/app/board/[teamId]/song/_components/song-list-view";
import {SongListItem} from "@/app/board/[teamId]/song/_components/song-list-item";

export default async function SongLayout({params, children}: any) {
  const teamId = params.teamId

  return (
    <>
      {children}
      <PageInit teamId={teamId} page={Page.SONG}/>
      <div className="w-full h-full flex flex-col items-center">
        <div className="flex-between w-full m-4">
          <p className="text-2xl font-semibold">
            Songs
          </p>
        </div>
        <SongListView/>
      </div>
    </>
  )
}

