import {SearchTags} from "@/app/board/_components/nav-bar/search-tags";
import {PageInit} from "@/components/page/page-init";
import {Routes} from "@/components/constants/enums";


export default function SongPage() {

  return (
    <div className="w-full h-full flex flex-col items-center">
      <PageInit route={Routes.SONG}/>
      <div className="w-full m-4">
        <p className="text-2xl font-semibold pb-4">
          Songs
        </p>
      </div>
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {
          Array.from(Array(30)).map((_, i) => (
            <div key={i} className="aspect-[3/2] bg-[#84A59D] rounded-lg"></div>
          ))
        }
      </div>
    </div>
  )
}
