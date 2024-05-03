import Image from 'next/image'
import {SongCarousel} from "@/app/worship/[teamId]/[id]/_components/song-carousel";
import {WorshipService} from "@/apis";
import {Worship} from "@/models/worship";
import {timestampToDate} from "@/components/helper/helper-functions";

export default async function WorshipPage({params}: any) {
  const worshipId = params.id
  const worship = await WorshipService.getById(worshipId) as Worship

  return (
    <div className="w-full flex-center">
      <div className="flex-start flex-col w-full px-6 gap-2 max-w-4xl">
        <p className="text-sm text-gray-500">{worship.team_id}</p>
        <p className="text-2xl font-semibold">{worship.title}</p>
        <div className="flex-center mt-6 gap-2">
          <Image alt="calendar icon" src={'/icons/calendarIcon.svg'} width={25} height={25}/>
          <p className="text-blue-900">{timestampToDate(worship.worship_date)}</p>
        </div>
        <p className="mt-10">
          {worship.description}
        </p>
        <div className="w-full flex-center flex-col mt-10">
          <SongCarousel songHeaderList={worship.songs}/>
        </div>
      </div>
    </div>
  )
}
