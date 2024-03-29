import {HoverOverlay} from "@/components/hover-overlay";
import Link from "next/link";

const songList = [
  "내 주를 가까이",
  "나의 소망 되신 주를 위해 바라보다",
  "오직 예수",
  "빛 되신 주"
]
export function WorshipCard() {
  return (
    <div>
      <Link href={"/worship/123"}>
        <div className="group aspect-[1/1] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC] cursor-pointer">
          <div className="relative flex-1 flex-center flex-col text-white text-xs font-semibold gap-2 p-2">
            <HoverOverlay/>
            {
              songList.map((song, i) => (
                <p key={i} className="line-clamp-1">{song}</p>
              ))
            }
          </div>
          <p className="p-4 bg-white text-xs line-clamp-1">
            2020/10/3 주일 찬양
          </p>
        </div>
      </Link>
      <p className="w-full text-center text-sm text-gray-600 mt-1">
        March 30 <span className="text-xs">(Mon)</span>
      </p>
    </div>
  )
}
