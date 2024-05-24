"use client"
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
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
import {currentTeamSongIdsAtom} from "@/global-states/song-state";

interface Props {
  songTitle: string
  songId: string
}

export function MenuButton({songTitle, songId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const setCurrentTeamSongIds = useSetRecoilState(currentTeamSongIdsAtom)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleEditSong() {
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

  return (
    <>
      <DeleteConfirmationDialog isOpen={isOpen} setOpen={setIsOpen} title="Delete Song" description={`Do you really want to delete [${songTitle}]? This action can't be undone.`} onDeleteHandler={handleDeleteSong}/>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2">
          <DropdownMenuGroup className="space-y-2">
            <DropdownMenuItem disabled className="cursor-pointer" onClick={() => handleEditSong()}>
               <DownloadIcon className="mr-3 w-5 h-5"/>
               <p>Download Score</p>
             </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator/>
          <DropdownMenuGroup className="space-y-2">
            <DropdownMenuItem disabled className="cursor-pointer">
               <LinkIcon className="mr-3 w-5 h-5"/>
               <p>Copy Link</p>
             </DropdownMenuItem>
            <DropdownMenuItem disabled className="cursor-pointer">
               <CopyIcon className="mr-3 w-5 h-5"/>
               <p>Duplicate</p>
             </DropdownMenuItem>
             <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditSong()}>
               <SquarePen className="mr-3 w-5 h-5"/>
               <p>Edit</p>
             </DropdownMenuItem>
             <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-500 cursor-pointer" onClick={() => setIsOpen((prev) => !prev)}>
               <Trash2Icon className="mr-3 w-5 h-5"/>
               <p>Delete</p>
             </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
