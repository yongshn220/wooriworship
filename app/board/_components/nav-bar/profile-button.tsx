import Image from "next/image";

import {SettingsIcon} from "lucide-react";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {MainLogo} from "@/components/logo/main-logo";


export function ProfileButton() {
  return (
    <Sheet>
      <SheetTrigger>
        <Image
          src={"/image/profileIcon.png"}
          alt="Logo"
          height={35}
          width={35}
          className="cursor-pointer"
        />
      </SheetTrigger>
      <SheetContent className="flex-start flex-col pt-10 space-y-2">
        <MainLogo/>
        <Button variant="outline" className="w-full">
          Account Setting
        </Button>
        <Button className="w-full">
          Sign Out
        </Button>
      </SheetContent>
    </Sheet>
  )
}
