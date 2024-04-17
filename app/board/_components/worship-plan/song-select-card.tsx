'use client'
import {HoverOverlay} from "@/components/hover-overlay";
import MoodNeutralIcon from '@/public/icons/moodNeutralIcon.svg'
import MoodCheckIcon from '@/public/icons/moodCheckIcon.svg'
import {Badge} from "@/components/ui/badge";
import {SongDetailCard} from "@/app/board/[teamId]/song/_components/song-detail-card";
import {useState} from "react";
import {Song} from "@/models/song";

interface Props {
  song: Song
  isSelected: boolean
  handleSelectSong: Function
}
export function SongSelectCard({song, isSelected, handleSelectSong}: Props) {
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
        <div className="w-full flex-center bg-white p-2">
          {
            isSelected ?
            <div className="w-full h-full flex justify-start items-center rounded-lg">
              <div className="cursor-pointer p-2 text-blue-500">
                <MoodCheckIcon/>
              </div>
              <p className="text-xs text-gray-500">Song added!</p>
            </div>
            :
            <div className="w-full h-full flex justify-start items-center cursor-pointer hover:bg-gray-100 rounded-lg" onClick={() => handleSelectSong(song.id)}>
              <div className="cursor-pointer p-2">
                <MoodNeutralIcon/>
              </div>
              <p className="text-xs text-gray-500">Click me to add!</p>
            </div>
          }
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
