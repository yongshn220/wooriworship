'use client'

import {Button} from "@/components/ui/button";
import {useState} from "react";
import {SongForm} from "@/app/board/[teamId]/song/_components/song-form";
import {Mode} from "@/components/constants/enums";
import {Song} from "@/models/song";

interface Props {
  song: Song
}

export function EditButton({song}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <SongForm mode={Mode.EDIT} isOpen={isOpen} setIsOpen={setIsOpen} song={song}/>
      <Button onClick={() => setIsOpen(prev => !prev)}>
        Edit
      </Button>
    </div>
  )
}
