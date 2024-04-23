'use client'

import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useSession} from "next-auth/react";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom, teamAtomById} from "@/global-states/teamState";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {Mode} from "@/components/constants/enums";

export function NewButton() {
  const {data: session} = useSession()
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtomById(teamId))
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <SongForm mode={Mode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen} song={null}/>
      <Button onClick={() => setIsOpen(prev => !prev)}>
        Add Song
      </Button>
    </div>
  )
}
