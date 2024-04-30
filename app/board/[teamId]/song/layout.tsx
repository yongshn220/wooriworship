import {NewButton} from "@/app/board/[teamId]/song/_components/new-button";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import SongService from "@/apis/SongService";
import {Song} from "@/models/song";
import {SongCardWrapper} from "@/app/board/[teamId]/song/_components/song-card-wrapper";

export default async function SongLayout({params, children}: any) {
  const teamId = params.teamId

  const songList = await SongService.getTeamSong(teamId) as Array<Song>
  const songIds = songList.map((song) => song.id)

  return (
    <>
      {children}
      <div className="w-full h-full flex flex-col items-center">
        <PageInit teamId={teamId} page={Page.SONG}/>
        <div className="flex-between w-full m-4">
          <p className="text-2xl font-semibold">
            Songs
          </p>
          <NewButton/>
        </div>
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
          {
            songIds.map((songId) => (
              <SongCardWrapper key={songId} songId={songId}/>
            ))
          }
        </div>
      </div>
    </>
  )
}

