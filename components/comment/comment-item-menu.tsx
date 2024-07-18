import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {EllipsisIcon, SquarePen, Trash2Icon} from "lucide-react";

interface Props {
  setIsEditMode: Function
}

export function CommentItemMenu({setIsEditMode}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisIcon className="text-gray-500 w-4 h-4"/>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {setIsEditMode(true)}}>
            <SquarePen className="mr-3 w-5 h-5"/>
            <p>Edit</p>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Trash2Icon className="mr-3 w-5 h-5"/>
            <p>Delete</p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
