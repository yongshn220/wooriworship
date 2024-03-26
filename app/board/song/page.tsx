import {SearchTags} from "@/app/board/_components/nav-bar/search-tags";
import {PageInit} from "@/components/page/page-init";
import {Routes} from "@/components/constants/enums";
import {Badge} from "@/components/ui/badge";
import {SongCard} from "@/app/board/song/_components/song-card";

const tags = ["빠른", "신나는", "엔딩곡", "강한비트", "경쾌한", "신나는", "엔딩곡", "강한비트", "경쾌한"]

export default function SongPage() {

  return (
    <div className="w-full h-full flex flex-col items-center">
      <PageInit route={Routes.SONG}/>
      <div className="w-full m-4">
        <p className="text-2xl font-semibold pb-4">
          Songs
        </p>
      </div>
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
        {
          Array.from(Array(30)).map((_, i) => (
            <SongCard key={i}/>
          ))
        }
      </div>
    </div>
  )
}
