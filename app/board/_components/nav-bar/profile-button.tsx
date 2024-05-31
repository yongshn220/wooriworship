import Image from "next/image";

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
import {MailIcon, SettingsIcon} from "lucide-react";
import {InvitationDialog} from "@/app/board/_components/nav-bar/invitation-dialog";
import {Suspense, useState} from "react";
import {pendingReceivedInvitationsAtom} from "@/global-states/invitation-state";
import {invitationDialogStateAtom} from "@/global-states/dialog-state";

export function ProfileButton() {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(authUser?.uid))
  const invitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email))
  const setInvitationDialogState = useSetRecoilState(invitationDialogStateAtom)
  const router = useRouter()

  async function handleSignOut() {
    try {
      await AuthService.logout();
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
        <Image
          src={"/image/profileIcon.png"}
          alt="Logo"
          height={35}
          width={35}
          className="cursor-pointer rounded-full"
        />
      </SheetTrigger>
      <SheetContent className="flex-start flex-col pt-10 space-y-2 w-[320px]">
        <MainLogo/>
        <div className="flex-1 flex flex-col w-full gap-1">
          <Button variant="ghost" className="w-full flex-start gap-2" onClick={() => setInvitationDialogState(true)}>
            <MailIcon className="w-[20px] h-[20px]"/>
            <p>Invitations</p>
            {
              invitations?.length > 0 &&
              <div className="rounded-full bg-red-500 w-5 h-5 text-white">{invitations?.length}</div>
            }
          </Button>
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
