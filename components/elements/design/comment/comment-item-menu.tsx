import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical, SquarePen, Trash2 } from "lucide-react";

interface Props {
  setIsEditMode: Function
}

export function CommentItemMenu({setIsEditMode}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted/60 active:bg-muted outline-none">
          <EllipsisVertical className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center justify-between cursor-pointer" onClick={() => {setIsEditMode(true)}}>
          Edit
          <SquarePen className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500">
          Delete
          <Trash2 className="w-4 h-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
