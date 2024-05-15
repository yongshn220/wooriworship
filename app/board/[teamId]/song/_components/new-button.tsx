'use client'

import {Button} from "@/components/ui/button";
import {useState} from "react";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {Mode} from "@/components/constants/enums";

export function NewButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <SongForm mode={Mode.CREATE} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <Button onClick={() => setIsOpen(prev => !prev)}>
        Add Song
      </Button>
    </div>
  )
}
