'use client'
import {HoverOverlay} from "@/components/hover-overlay";
import LinkIcon from '@/public/icons/linkIcon.svg'
import HeartIcon from '@/public/icons/heartIcon.svg'
import {Badge} from "@/components/ui/badge";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {useEffect, useState} from "react";
import {Song} from "@/models/song";
import {useRouter} from "next/navigation";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {SongService} from "@/apis";
import {songAtom} from "@/app/board/[teamId]/song/_states/song-board-states";


interface Props {
  songId: string
}
export function SongCard({songId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const song = useRecoilValue(songAtom(songId))
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleSongCardClick() {
    router.push(`/board/${teamId}/song/${song.id}`)
  }

  return (
    <div className="h-full">
      <div className="aspect-[5/4] border rounded-lg flex flex-col overflow-hidden bg-[#95ABCC]">
        <div className="relative group h-full flex-center flex-col text-white cursor-pointer" onClick={handleSongCardClick}>
          <HoverOverlay/>
          <p className="font-semibold text-base">{song?.title}</p>
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
