'use client'

import {useRecoilState, useRecoilValue} from "recoil";
import {worshipMenuAtom} from "@/app/worship/[teamId]/[worshipId]/_states/worship-detail-states";
import {MenuIcon, DoorOpenIcon, SquarePenIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {useRouter} from "next/navigation";
import {getPathWorship} from "@/components/helper/routes";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {SelectIcon} from "@radix-ui/react-select";
import {
  MultipleSheetsViewSelect
} from "@/app/worship/[teamId]/[worshipId]/live/_components/multiple-sheets-view-select";

interface Props {
  teamId: string,
  worshipId: string,
}

export function WorshipLiveMenu({teamId, worshipId}: Props) {
  const [menu, setMenu] = useRecoilState(worshipMenuAtom)
  const router = useRouter()

  function handleExit() {
    router.replace(getPathWorship(teamId, worshipId))
  }

  return (
    <div className="absolute top-2 right-2 bottom-10">
      <Popover>
        <PopoverTrigger asChild>
          <div className="p-2 rounded-full hover:bg-black/5 cursor-pointer">
            <MenuIcon/>
          </div>
        </PopoverTrigger>
        <PopoverContent className="mr-4 p-2 space-y-2">
          <div className="flex-between cursor-pointer hover:bg-gray-100 py-2 px-2 rounded-sm"
               onClick={() => setMenu((prev) => ({...prev, showSongNote: !prev.showSongNote}))}>
            <Label>Show Song Note</Label>
            <Switch className="data-[state=checked]:bg-blue-500" checked={menu.showSongNote}/>
          </div>
          <div className="flex-between cursor-pointer hover:bg-gray-100 py-2 px-2 rounded-sm"
               onClick={() => setMenu((prev) => ({...prev, showSongNumber: !prev.showSongNumber}))}>
            <Label>Show Song Number</Label>
            <Switch className="data-[state=checked]:bg-blue-500" checked={menu.showSongNumber}/>
          </div>
          <Separator/>
          <div className="flex-between py-2 px-2 rounded-sm">
            <Label className="w-full">Multiple Sheets View</Label>
            <MultipleSheetsViewSelect/>
          </div>
          <Separator/>
          <Button disabled variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-gray-100 pl-2">
            <SquarePenIcon className="mr-3 w-5 h-5"/>
            <Label>Notating Mode</Label>
          </Button>
          <Separator/>
          <Button variant="ghost" className="w-full flex justify-start cursor-pointer hover:bg-gray-100 pl-2"
                  onClick={handleExit}>
            <DoorOpenIcon className="mr-3 w-5 h-5"/>
            <Label>Exit Worship</Label>
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
