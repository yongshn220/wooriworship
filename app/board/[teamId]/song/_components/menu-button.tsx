"use client"
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {getPathSong, getPathSongEdit} from "@/components/helper/routes";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {SongService} from "@/apis";
import {toast} from "@/components/ui/use-toast";
import {CopyIcon, SquarePen, Trash2Icon, LinkIcon, DownloadIcon} from "lucide-react";
import {currentTeamSongIdsAtom, songAtom} from "@/global-states/song-state";
import {Button} from "@/components/ui/button";
import {downloadMultipleMusicSheets} from "@/components/helper/helper-functions";

interface Props {
  songTitle: string
  songId: string
}

export function MenuButton({songTitle, songId}: Props) {
  const song = useRecoilValue(songAtom(songId))
  const teamId = useRecoilValue(currentTeamIdAtom)
  const setCurrentTeamSongIds = useSetRecoilState(currentTeamSongIdsAtom(teamId))
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  async function handleEditSong() {
    router.push(getPathSongEdit(teamId, songId))
  }

  async function handleDeleteSong() {
    try {
      SongService.deleteSong(songId).then((isSuccess) => {
        if (isSuccess) {
          setCurrentTeamSongIds((prev) => prev.filter(_id => _id !== songId))
          toast({title: "Song deleted successfully", description: ""})
        }
        else {
          toast({title: "Fail to delete song", description: "Something went wrong. Please try again later."})
        }
      })
    }
    catch (e) {
      console.log(e)
      toast({title: "Fail to delete song", description: "Something went wrong. Please try again later."})
    }
    finally {
      router.replace(getPathSong(teamId))
    }
  }

  async function handleDownloadSong() {
    await downloadMultipleMusicSheets([song])
  }

  return (
    <>
      <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} setOpen={setDeleteDialogOpen} title="Delete Song" description={`Do you really want to delete [${songTitle}]? This action can't be undone.`} onDeleteHandler={handleDeleteSong}/>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2 flex-center flex-col">
          <DropdownMenuGroup className="space-y-2 w-full">
            <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => handleDownloadSong()}>
               <DownloadIcon className="mr-3 w-5 h-5"/>
               <p>Download Score</p>
             </Button>
          </DropdownMenuGroup>
          <DropdownMenuSeparator/>
          <DropdownMenuGroup className="space-y-2 flex-center flex-col w-full">
            <Button variant="ghost" disabled className="cursor-pointer w-full flex-start pl-2">
               <LinkIcon className="mr-3 w-5 h-5"/>
               <p>Copy Link</p>
             </Button>
            <Button variant="ghost" disabled className="cursor-pointer w-full flex-start pl-2">
               <CopyIcon className="mr-3 w-5 h-5"/>
               <p>Duplicate</p>
             </Button>
             <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => handleEditSong()}>
               <SquarePen className="mr-3 w-5 h-5"/>
               <p>Edit</p>
             </Button>
             <Button variant="ghost" className="text-red-600 focus:bg-red-50 focus:text-red-500 cursor-pointer w-full flex-start pl-2" onClick={() => setDeleteDialogOpen((prev) => !prev)}>
               <Trash2Icon className="mr-3 w-5 h-5"/>
               <p>Delete</p>
             </Button>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
