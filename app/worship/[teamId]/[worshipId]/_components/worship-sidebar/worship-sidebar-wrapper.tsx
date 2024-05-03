import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {SongService, WorshipService} from "@/apis";
import {toPlainObject} from "@/components/helper/helper-functions";
import {Worship} from "@/models/worship";


interface Props {
  worshipId: string
}
export async function WorshipSidebarWrapper({worshipId}: Props) {
  console.log(worshipId)
  const worship = await WorshipService.getById(worshipId) as Worship
  console.log(worship)

  const songListPromise = worship?.songs?.map(header => SongService.getById(header.id))
  if (!songListPromise) return <></>

  const songList = await Promise.all(songListPromise)

  return (
    <WorshipSidebar songList={toPlainObject(songList)}/>
  )
}
