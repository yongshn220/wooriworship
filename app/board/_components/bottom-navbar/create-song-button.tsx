'use client'

import {useState} from "react";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {FormMode} from "@/components/constants/enums";
import {LibraryBig} from "lucide-react";

export function CreateSongButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <SongForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <div className="flex-center flex-col space-y-1 cursor-pointer" onClick={() => setIsOpen(prev => !prev)}>
        <div className="flex-center w-20 h-20 bg-gray-300 rounded-lg">
          <LibraryBig/>
        </div>
        <p className="text-sm">Song</p>
      </div>
    </div>
  )
}
