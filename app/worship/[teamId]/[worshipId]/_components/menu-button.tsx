"use client"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {getPathPlan, getPathWorshipEdit} from "@/components/helper/routes";
import {useRecoilValue} from "recoil";
import {currentTeamIdAtom} from "@/global-states/teamState";
import { WorshipService } from "@/apis";


interface Props {
  title: string
  worshipId: string
}
export function MenuButton({title, worshipId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleEditWorship() {
    router.push(getPathWorshipEdit(teamId, worshipId))
  }

  async function handleDeleteWorship() {
    try {
      await WorshipService.deleteWorship(worshipId);
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
        <DropdownMenuContent>
           <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditWorship()}>
             Edit
           </DropdownMenuItem>
           <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-500 cursor-pointer" onClick={() => setIsOpen((prev) => !prev)}>
             Delete
           </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
