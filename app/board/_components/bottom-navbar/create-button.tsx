import {Drawer, DrawerContent, DrawerHeader, DrawerTrigger,} from "@/components/ui/drawer"
import {PlusCircleIcon} from "lucide-react";
import {CreateWorshipButton} from "@/app/board/_components/bottom-navbar/create-worship-button";
import {CreateSongButton} from "@/app/board/_components/bottom-navbar/create-song-button";
import {CreateTeamButton} from "@/app/board/_components/bottom-navbar/create-team-button";
import {DialogTitle} from "@/components/ui/dialog";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

export function CreateButton() {

  return (
    <Drawer>
      <DrawerTrigger className="flex-center flex-col">
        <PlusCircleIcon strokeWidth={3}/>
        <p className="text-sm prevent-text-select">Create</p>
      </DrawerTrigger>
      <DrawerContent className="w-full min-h-[240px]">
        <VisuallyHidden>
          <DialogTitle>
            Create Menu
          </DialogTitle>
        </VisuallyHidden>
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
