"use client"

import { SongService } from "@/apis";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {Button} from "@/components/ui/button";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { useRouter } from "next/navigation";
import {useState} from "react";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {getPathSong} from "@/components/helper/routes"
import {currentTeamSongIdsAtom} from "@/app/board/[teamId]/song/_states/song-board-states";
import {toast} from "@/components/ui/use-toast";

interface Props {
  songTitle: string
  songId: string
}

export function DeleteSongButton({songTitle, songId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const setCurrentTeamSongIds = useSetRecoilState(currentTeamSongIdsAtom)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  async function handleDeleteSong() {
    try {
      if (await SongService.deleteSong(songId) === false) {
        toast({title: "Fail to delete song", description: "Something went wrong. Please try again later."})
      }

      setCurrentTeamSongIds((prev) => prev.filter(_id => _id !== songId))
      toast({title: "Song deleted successfully", description: ""})
    }
    catch (e) {
      console.log(e)
      toast({title: "Fail to delete song", description: "Something went wrong. Please try again later."})
    }
    finally {
      router.replace(getPathSong(teamId))
    }
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
