import {SongCarousel} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel";
import {TeamService, WorshipService} from "@/apis";
import {SongHeader, Worship} from "@/models/worship";
import {timestampToDate} from "@/components/helper/helper-functions";
import {Team} from "@/models/team";
import CalendarIcon from '@/public/icons/calendarIcon.svg'
import {SongItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-item";
import {Separator} from "@/components/ui/separator";
import {MenuButton} from "@/app/worship/[teamId]/[worshipId]/_components/menu-button";
import UsersIcon from '@/public/icons/usersIcon.svg'

export default async function WorshipPage({params}: any) {
  const worshipId = params.worshipId
  const worship = await WorshipService.getById(worshipId) as Worship
  const team = await TeamService.getById(worship.team_id) as Team

  return (
    <div className="w-full flex-center">
      <div className="flex-start flex-col w-full px-6 gap-2 max-w-4xl">
        <div className="flex-between w-full">
          <p className="text-4xl font-semibold">{worship.title}</p>
          <MenuButton title={worship.title}/>
        </div>
        <div className="flex-start mt-6 gap-2">
          <div className="flex-start gap-2 w-52">
            <UsersIcon className="text-gray-500"/>
            <p className="text-gray-500">Team</p>
          </div>
          <p>{team.name}</p>
        </div>
        <div className="flex-start mt-2 gap-2">
          <div className="flex-start gap-2 w-52">
            <CalendarIcon className="text-gray-500"/>
            <p className="text-gray-500">Worship Date</p>
          </div>
          <p>{timestampToDate(worship.worship_date)}</p>
        </div>
        <p className="mt-10">
          {worship.description}
        </p>
        <div className="w-full flex-start flex-col my-2 mt-10">
          <p className="font-semibold">Song List</p>
          <Separator/>
        </div>
        <div className="flex flex-col w-full gap-4">
          {
            worship.songs.map((songHeader: SongHeader, index: number) => (
              <SongItem key={songHeader.id} songHeader={songHeader} index={index + 1}/>
            ))
          }
        </div>
        <div className="w-full flex-start flex-col my-2 mt-10">
          <p className="font-semibold">Music Sheets</p>
          <Separator/>
        </div>
        <div className="w-full flex-center flex-col">
          <SongCarousel songHeaderList={worship.songs}/>
        </div>
      </div>
    </div>
  )
}