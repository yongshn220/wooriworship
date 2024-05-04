"use client"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {DeleteConfirmationDialog} from "@/components/dialog/delete-confirmation-dialog";
import {useState} from "react";


interface Props {
  title: string
}
export function MenuButton({title}: Props) {
  const [isOpen, setIsOpen] = useState(false)

  function handleEditWorship() {

  }

  async function handleDeleteWorship() {
    console.log("delete worship")
  }

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isOpen}
        setOpen={setIsOpen}
        title={`Delete Worship`}
        description={`This will permanently delete [${title}]. This action cannot be undone.`}
        onDeleteHanlder={handleDeleteWorship}
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
