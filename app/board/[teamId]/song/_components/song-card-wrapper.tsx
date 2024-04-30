import {SongService} from "@/apis";
import {SongCard} from "@/app/board/[teamId]/song/_components/song-card";
import {Song} from "@/models/song";
import {toPlainObject} from "@/components/helper/helper-functions";

interface Props {
  songId: string
}
export async function SongCardWrapper({songId}: Props) {
  const song = await SongService.getById(songId) as Song
  if (!song) return <></>

  return (
    <SongCard song={toPlainObject(song)}/>
  )
}
