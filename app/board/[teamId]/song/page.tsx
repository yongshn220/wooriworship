
import {SongCard} from "@/app/board/[teamId]/song/_components/song-card";
import {NewButton} from "@/app/board/[teamId]/song/_components/new-button";
import {PageInit} from "@/components/page/page-init";
import {Page} from "@/components/constants/enums";
import SongService from "@/apis/SongService";
import {Song} from "@/models/song";
import {SongCardList} from "@/app/board/[teamId]/song/_components/song-card-list";


export default async function SongPage({params}: any) {
  const teamId = params.teamId

  const songList = await SongService.getTeamSong(teamId) as Array<Song>

  return (
    <div className="w-full h-full flex flex-col items-center">
      <PageInit teamId={teamId} page={Page.SONG}/>
      <div className="flex-between w-full m-4">
        <p className="text-2xl font-semibold">
          Songs
        </p>
        <NewButton/>
      </div>
      <SongCardList songList={songList}/>
    </div>
  )
}
