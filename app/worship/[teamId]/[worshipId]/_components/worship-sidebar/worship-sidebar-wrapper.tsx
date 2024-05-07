import {WorshipSidebar} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-sidebar";
import {SongService, WorshipService} from "@/apis";
import {toPlainObject} from "@/components/helper/helper-functions";
import {Worship} from "@/models/worship";
import {WorshipSetup} from "@/app/worship/[teamId]/[worshipId]/_components/worship-sidebar/worship-setup";
import {MainLogo} from "@/components/logo/main-logo";
import {MdSidebar} from "@/components/sidebar/md-sidebar";


interface Props {
  worshipId: string
}
export async function WorshipSidebarWrapper({worshipId}: Props) {
  const worship = await WorshipService.getById(worshipId) as Worship

  const songListPromise = worship?.songs?.map(header => SongService.getById(header.id))
  if (!songListPromise) return <></>

  let songList = await Promise.all(songListPromise)

  return (
    <>
      <WorshipSetup worship={toPlainObject(worship)} songList={toPlainObject(songList)}/>
      <MdSidebar className="px-5 shadow-lg">
        <MainLogo/>
        <WorshipSidebar/>
      </MdSidebar>
    </>
  )
}
