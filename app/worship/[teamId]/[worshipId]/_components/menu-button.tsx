"use client"
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {getPathEditPlan, getPathPlan} from "@/components/helper/routes";
import {useSetRecoilState} from "recoil";
import { WorshipService } from "@/apis";
import {CopyIcon, LinkIcon, SquarePen, Trash2Icon} from "lucide-react";
import {currentTeamWorshipIdsAtom, worshipIdsUpdaterAtom} from "@/global-states/worship-state";
import {toast} from "@/components/ui/use-toast";


interface Props {
  teamId: string
  title: string
  worshipId: string
}
export function MenuButton({teamId, title, worshipId}: Props) {
  const setCurrentWorshipIds = useSetRecoilState(currentTeamWorshipIdsAtom(teamId))

  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleEditWorship() {
    router.push(getPathEditPlan(teamId, worshipId))
  }

  async function handleDeleteWorship() {
    try {
      WorshipService.deleteWorship(worshipId).then(isSuccess => {
        if (isSuccess) {
          setCurrentWorshipIds(prev => prev.filter(_id => _id !== worshipId))
          toast({title: `[${title}] is deleted successfully.`})
        }
        else {
          toast({title: "Something went wrong. Please try again later."})
        }
      })
      return true
    }
    catch {
      console.log("error");
      return false
    }
    finally {
      router.replace(getPathPlan(teamId))
    }
  }

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isOpen}
        setOpen={setIsOpen}
        title={`Delete Worship`}
        description={`This will permanently delete [${title}]. This action cannot be undone.`}
        onDeleteHandler={handleDeleteWorship}
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2">
          <DropdownMenuGroup className="space-y-2">
            <DropdownMenuItem disabled className="cursor-pointer">
             <LinkIcon className="mr-3 w-5 h-5"/>
             <p>Copy Link</p>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="cursor-pointer">
             <CopyIcon className="mr-3 w-5 h-5"/>
             <p>Duplicate</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditWorship()}>
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
