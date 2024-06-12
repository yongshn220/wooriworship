'use client'

import {Button} from "@/components/ui/button";
import {useState} from "react";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {FormMode} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {LibraryBig} from "lucide-react";

export function CreateSongButton() {
  const [isOpen, setIsOpen] = useState(false)
  const teamId = useRecoilValue(currentTeamIdAtom)

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
