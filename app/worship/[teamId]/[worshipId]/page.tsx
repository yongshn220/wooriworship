import {SongCarousel} from "@/app/worship/[teamId]/[worshipId]/_components/song-carousel";
import {TeamService, WorshipService} from "@/apis";
import {SongHeader, Worship} from "@/models/worship";
import {timestampToDate} from "@/components/helper/helper-functions";
import {Team} from "@/models/team";
import CalendarIcon from '@/public/icons/calendarIcon.svg'
import {SongItem} from "@/app/worship/[teamId]/[worshipId]/_components/song-item";
import {Separator} from "@/components/ui/separator";
import {SongCardWrapper} from "@/app/board/[teamId]/song/_components/song-card-wrapper";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";

export default async function WorshipPage({params}: any) {
  const worshipId = params.worshipId
  const worship = await WorshipService.getById(worshipId) as Worship
  const team = await TeamService.getById(worship.team_id) as Team

  return (
    <div className="w-full flex-center">
      <div className="flex-start flex-col w-full px-6 gap-2 max-w-4xl">
        <p className="text-sm text-gray-500">{team.name}</p>
        <p className="text-2xl font-semibold">{worship.title}</p>
        <div className="flex-center mt-6 gap-2">
          <CalendarIcon/>
          <p className="text-blue-900">{timestampToDate(worship.worship_date)}</p>
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
