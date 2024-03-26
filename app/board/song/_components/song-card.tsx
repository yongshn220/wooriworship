import {HoverOverlay} from "@/components/hover-overlay";
import Link from "next/link";
import LinkIcon from '@/public/icons/linkIcon.svg'
import HeartIcon from '@/public/icons/heartIcon.svg'

const tags = ["빠른", "신나는", "엔딩곡", "강한비트", "경쾌한", "신나는", "엔딩곡", "강한비트", "경쾌한"]

export function SongCard() {
  return (
    <div>
      <div
        className="group aspect-[1/1] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC] cursor-pointer">
        <div className="relative h-full flex-center flex-col text-white">
          <HoverOverlay/>
          <p className="font-semibold text-lg">내 주를 가까이</p>
          <p className="text-sm">Isaiah6tyone</p>
        </div>
        <div className="flex-between bg-white p-4">
          <HeartIcon/>
          <LinkIcon/>
        </div>
      </div>
      <p className="w-full text-center text-sm text-gray-600 mt-1">
        March 30 <span className="text-xs">(Mon)</span>
      </p>
    </div>
  )
}
