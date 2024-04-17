'use client'
import {HoverOverlay} from "@/components/hover-overlay";
import LinkIcon from '@/public/icons/linkIcon.svg'
import HeartIcon from '@/public/icons/heartIcon.svg'
import {Badge} from "@/components/ui/badge";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {useState} from "react";
import {Song} from "@/models/song";

const tags = ["빠른", "신나는", "엔딩곡", "강한비트", "경쾌한", "신나는"]

interface Props {
  song: Song
}
export function SongCard({song}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="h-full">
      <SongDetailCard isOpen={isOpen} setIsOpen={setIsOpen} song={song}/>
      <div className="aspect-[1/1] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC]">
        <div className="relative group h-full flex-center flex-col text-white cursor-pointer" onClick={() => setIsOpen(true)}>
          <HoverOverlay/>
          <p className="font-semibold text-lg">{song?.title}</p>
          <p className="text-sm">{song?.original.author}</p>
        </div>
        <div className="flex-between bg-white p-2">
          <div className="cursor-pointer hover:bg-gray-100 rounded-full p-2">
            <HeartIcon/>
          </div>
          <div className="cursor-pointer hover:bg-gray-100 rounded-full p-2">
            <LinkIcon/>
          </div>
        </div>
      </div>
      <div className="w-full text-left text-sm mt-1 space-x-2 space-y-2">
        {
          song?.tags.map((tag,i) => (
            <Badge key={i} variant="outline">{tag}</Badge>
          ))
        }
      </div>
    </div>
  )
}