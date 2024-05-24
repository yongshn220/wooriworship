'use client'

import {Button} from "@/components/ui/button";
import {useState} from "react";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {FormMode} from "@/components/constants/enums";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";

export function NewSongButton() {
  const [isOpen, setIsOpen] = useState(false)
  const teamId = useRecoilValue(currentTeamIdAtom)

  return (
    <div>
      <SongForm mode={FormMode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <Button disabled={!teamId} className="bg-blue-500 hover:bg-blue-400" onClick={() => setIsOpen(prev => !prev)}>
        + Add Song
      </Button>
    </div>
  )
}
