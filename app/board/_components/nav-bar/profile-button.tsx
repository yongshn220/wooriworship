import Image from "next/image";

import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {MainLogo} from "@/components/logo/main-logo";
import {useRouter} from "next/navigation";
import { AuthService } from "@/apis"

export function ProfileButton() {

  const router = useRouter()

  async function handleSignOut() {
    try {
      await AuthService.logout();
      router.replace("/")
    }
    catch (err: any) {
      console.log(err.code);
    }
  }

  return (
    <Sheet>
      <SheetTrigger>
        <Image
          src={"/image/profileIcon.png"}
          alt="Logo"
          height={35}
          width={35}
          className="cursor-pointer rounded-full"
        />
      </SheetTrigger>
      <SheetContent className="flex-start flex-col pt-10 space-y-2">
        <MainLogo/>
        <Button variant="outline" className="w-full">
          Account Setting
        </Button>
        <Button className="w-full" onClick={handleSignOut}>
          Sign Out
        </Button>
      </SheetContent>
    </Sheet>
  )
}
