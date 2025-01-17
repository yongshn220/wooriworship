import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import MenuIcon from "@/public/icons/menuIcon.svg";
import {Button} from "@/components/ui/button";
import {SquarePen, Trash2Icon} from "lucide-react";
import { getPathEditNotice } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";

interface Props {
  noticeId: string
}

export function NoticeHeaderMenu({noticeId}: Props) {
  const teamId = useRecoilValue(currentTeamIdAtom)
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon/>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <Button variant="ghost" className="cursor-pointer w-full flex-start pl-2" onClick={() => router.push(getPathEditNotice(teamId, noticeId))}>
            <SquarePen className="mr-3 w-5 h-5"/>
            <p>Edit</p>
          </Button>
          <Button disabled={true} variant="ghost" className="text-red-600 focus:bg-red-50 focus:text-red-500 cursor-pointer w-full flex-start pl-2" >
            <Trash2Icon className="mr-3 w-5 h-5"/>
            <p>Delete</p>
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
