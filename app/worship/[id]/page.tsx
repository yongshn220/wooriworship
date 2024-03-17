import Image from 'next/image'
import {SongCarousel} from "@/app/worship/[id]/_components/song-carousel";

export default function WorshipPage() {
  return (
    <div className="w-full flex-center">
      <div className="flex-start flex-col w-full px-6 gap-2 max-w-4xl">
        <p className="text-sm text-gray-500">GVC Friday</p>
        <p className="text-2xl font-semibold">GVC Friday Worship</p>
        <div className="flex-center mt-6 gap-2">
          <Image alt="calendar icon" src={'/icons/calendarIcon.svg'} width={25} height={25}/>
          <p className="text-blue-900">March 16th, 2024</p>
        </div>
        <p className="mt-10">
          이번 콘티의 주제 말씀은 ... 마태복음 ..... 입니다.
          주님께서 우리에 주신 사랑과 은혜를 생각해보며.. ~~ 콘티 주제~~~ 뭐시기 주님께서 우리에 주신 사랑과 은혜를 생각해보며.. ~~ 콘티 주제~~~ 뭐시기
        </p>
        <div className="w-full flex-center">
          <SongCarousel/>
        </div>
      </div>
    </div>
  )
}
