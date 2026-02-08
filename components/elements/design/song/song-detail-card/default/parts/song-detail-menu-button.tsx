"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPathSong, getPathSongEdit } from "@/components/util/helper/routes";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { SongApi } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { SquarePen, Trash2, Download, EllipsisVertical } from "lucide-react";
import { songAtom, songUpdaterAtom } from "@/global-states/song-state";
import { downloadMultipleMusicSheets } from "@/components/util/helper/helper-functions";
import { DeleteConfirmationDialog } from "@/components/elements/dialog/user-confirmation/delete-confirmation-dialog";

interface Props {
  teamId: string
  songTitle: string
  songId: string
  readOnly?: boolean
}

export function SongDetailMenuButton({ teamId, songTitle, songId, readOnly = false }: Props) {
  const song = useRecoilValue(songAtom({ teamId, songId }))
  const setSongUpdater = useSetRecoilState(songUpdaterAtom)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  async function handleEditSong() {
    router.push(getPathSongEdit(teamId, songId))
  }

  async function handleDeleteSong() {
    try {
      const isSuccess = await SongApi.deleteSong(teamId, songId)
      if (isSuccess) {
        setSongUpdater((prev) => prev + 1)
        toast({ title: "Song deleted successfully", description: "" })
        router.replace(getPathSong(teamId))
      }
      else {
        toast({ title: "Fail to delete song-board", description: "Something went wrong. Please try again later." })
      }
    }
    catch (e) {
      console.log(e)
      toast({ title: "Fail to delete song-board", description: "Something went wrong. Please try again later." })
    }
  }

  async function handleDownloadSong() {
    await downloadMultipleMusicSheets([song])
  }

  return (
    <>
      <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} setOpen={setDeleteDialogOpen} title="Delete Song" description={`Do you really want to delete [${songTitle}]? This action can't be undone.`} onDeleteHandler={handleDeleteSong} />
      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none" data-testid="song-menu">
            <EllipsisVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-1200 bg-white dark:bg-background">
          <DropdownMenuItem className="flex items-center justify-between cursor-pointer" onClick={handleDownloadSong}>
            Download Score
            <Download className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center justify-between cursor-pointer" onClick={handleEditSong} data-testid="song-edit">
            Edit
            <SquarePen className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuItem>
          {!readOnly && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
                onClick={() => setDeleteDialogOpen(true)}
                data-testid="song-delete"
              >
                Delete
                <Trash2 className="w-4 h-4" />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
