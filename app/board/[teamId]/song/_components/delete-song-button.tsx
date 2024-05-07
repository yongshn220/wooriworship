"use client"

import { SongService } from "@/apis";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {Button} from "@/components/ui/button";
import {useState} from "react";

interface Props {
  songTitle: string
  songId: string
}

export function DeleteSongButton({songTitle, songId}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  async function handleDeleteSong() {
    return await SongService.deleteSong(songId)
  }

  return (
    <>
      <DeleteConfirmationDialog isOpen={isOpen} setOpen={setIsOpen} title="Delete Song" description={`Do you really want to delete [${songTitle}]? This action can't be undone.`} onDeleteHanlder={handleDeleteSong}/>
      <Button variant="ghost" className="text-red-500 hover:text-red-500 hover:bg-red-50" onClick={() => setIsOpen((prev) => !prev)}>
        Delete
      </Button>
    </>
  )
}
