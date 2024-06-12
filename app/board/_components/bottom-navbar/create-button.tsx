import {
  Drawer, DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {LayoutDashboard, LibraryBig, PlusCircleIcon, UsersIcon} from "lucide-react";
import {CreateWorshipButton} from "@/app/board/_components/bottom-navbar/create-worship-button";
import {CreateSongButton} from "@/app/board/_components/bottom-navbar/create-song-button";
import {CreateTeamButton} from "@/app/board/_components/bottom-navbar/create-team-button";

export function CreateButton() {

  return (
    <Drawer>
      <DrawerTrigger className="flex-center flex-col">
        <PlusCircleIcon/>
        <p className="text-sm">Create</p>
      </DrawerTrigger>
      <DrawerContent className="w-full min-h-[240px]">
        <DrawerHeader>
          <p className="font-semibold">Start creating now</p>
        </DrawerHeader>
        <div className="w-full h-full flex-center gap-4">
          <CreateWorshipButton/>
          <CreateSongButton/>
          <CreateTeamButton/>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
