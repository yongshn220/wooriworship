"use client"

import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {MainLogo} from "@/components/logo/main-logo";
import {useRouter} from "next/navigation";
import { AuthService } from "@/apis"
import {toast} from "@/components/ui/use-toast";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {userAtom} from "@/global-states/userState";
import {auth} from "@/firebase";
import {Separator} from "@/components/ui/separator";
import {SettingsIcon} from "lucide-react";
import {InvitationButton} from "@/components/dialog/static-dialog/invitation/invitation-button";
import {currentTeamIdAtom} from "@/global-states/teamState";

export function ProfileButton() {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(authUser?.uid))
  const setCurrentTeam = useSetRecoilState(currentTeamIdAtom)
  const router = useRouter()

  async function handleSignOut() {
    try {
      await AuthService.logout();
      setCurrentTeam(null)
      toast({title: `Goodbye, ${user.name} :)`})
      router.replace("/")
    }
    catch (err: any) {
      console.log(err.code);
    }
  }

  return (
    <Sheet>
      <SheetTrigger>
        <div className="gradient-border w-9 h-9 rounded-full flex-center">
          <div className="bg-orange-400 w-5/6 h-5/6 z-20 rounded-full flex-center text-white">
            {user?.email[0].toUpperCase()}
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="flex-start flex-col pt-10 space-y-2 w-[320px]">
        <MainLogo/>
        <div className="flex-1 flex flex-col w-full gap-1">
          <InvitationButton/>
          <Button disabled={true} variant="ghost" className="w-full flex-start gap-2">
            <SettingsIcon className="w-[20px] h-[20px]"/>
            <p>Account Setting</p>
          </Button>
          <Separator/>
        </div>
        <div className="w-full">
          <Button className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
