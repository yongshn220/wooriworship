import {HoverOverlay} from "@/components/hover-overlay";
import {WorshipCard} from "@/app/board/_components/worship-plan/worship-card";


export default function Board() {
  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 overflow-y-scroll">
      <p className="text-2xl font-semibold pb-4">
        Worship Plan
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        <WorshipCard/>
        <WorshipCard/>
        <WorshipCard/>
        <WorshipCard/>
      </div>
    </div>
  )
}
