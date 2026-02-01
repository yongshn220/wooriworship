"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPathSong, getPathSongEdit } from "@/components/util/helper/routes";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { SongApi } from "@/apis";
import { toast } from "@/components/ui/use-toast";
import { CopyIcon, SquarePen, Trash2Icon, LinkIcon, DownloadIcon } from "lucide-react";
import { currentTeamSongIdsAtom, songAtom, songUpdaterAtom } from "@/global-states/song-state";
import { Button } from "@/components/ui/button";
import { downloadMultipleMusicSheets } from "@/components/util/helper/helper-functions";
import { musicSheetsBySongIdAtom } from "@/global-states/music-sheet-state";
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
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="song-menu">
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2 flex-center flex-col">
          <DropdownMenuGroup className="space-y-2 w-full">
            <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => handleDownloadSong()}>
              <DownloadIcon className="mr-3 w-5 h-5" />
              <p>Download Score</p>
            </Button>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="space-y-2 flex-center flex-col w-full">
            <Button variant="ghost" disabled className="cursor-pointer w-full flex-start pl-2">
              <LinkIcon className="mr-3 w-5 h-5" />
              <p>Copy Link</p>
            </Button>
            <Button variant="ghost" disabled className="cursor-pointer w-full flex-start pl-2">
              <CopyIcon className="mr-3 w-5 h-5" />
              <p>Duplicate</p>
            </Button>
            <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => handleEditSong()} data-testid="song-edit">
              <SquarePen className="mr-3 w-5 h-5" />
              <p>Edit</p>
            </Button>
            {!readOnly && (
              <Button variant="ghost" className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer w-full flex-start pl-2" onClick={() => setDeleteDialogOpen((prev) => !prev)} data-testid="song-delete">
                <Trash2Icon className="mr-3 w-5 h-5" />
                <p>Delete</p>
              </Button>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
