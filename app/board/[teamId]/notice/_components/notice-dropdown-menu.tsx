import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {Button} from "@/components/ui/button";
import {SquarePen, Trash2Icon} from "lucide-react";
import {useState} from "react";
import {NoticeForm} from "@/app/board/[teamId]/_components/notice-form";
import {FormMode} from "@/components/constants/enums";

interface Props {
  noticeId: string
}

export function NoticeDropdownMenu({noticeId}: Props) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)

  function handleEditSong() {
    setEditDialogOpen(true)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon/>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <NoticeForm mode={FormMode.EDIT} noticeId={noticeId} isOpen={isEditDialogOpen} setIsOpen={setEditDialogOpen}/>
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
  )
}
