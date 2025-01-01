"use client"

import {Drawer, DrawerContent, DrawerHeader} from "@/components/ui/drawer"
import {SettingsIcon, UsersIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {AuthService} from "@/apis";
import {toast} from "@/components/ui/use-toast";
import {useSetRecoilState} from "recoil";
import {useRouter} from "next/navigation";
import {InvitationButton} from "@/components/dialog-manager/invitation/invitation-button";
import {Separator} from "@/components/ui/separator";
import {currentTeamIdAtom} from "@/global-states/teamState";
import {ManageTeamDialog} from "@/app/board/_components/nav-bar/manage-team-dialog";

interface Props {
  isOpen: boolean
  setIsOpen: Function
}
export function SettingDialog({isOpen, setIsOpen}: Props) {
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const router = useRouter()

  async function handleSignOut() {
    try {
      await AuthService.logout();
      setCurrentTeamId(null)
      toast({title: `Goodbye :)`})
      router.replace("/")
    }
    catch (err: any) {
      console.log(err.code);
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <DrawerContent className="w-full min-h-[240px]">
        <DrawerHeader>
          <p className="font-semibold prevent-text-select">Wooriworship</p>
        </DrawerHeader>
        <div className="w-full h-full flex-center flex-col gap-4 p-2">
          <ManageTeamDialog>
            <Button variant="ghost" className="w-full flex-start gap-2">
              <UsersIcon className="w-[20px] h-[20px]"/>
              <p className="prevent-text-select">Manage Team</p>
            </Button>
          </ManageTeamDialog>
          <InvitationButton/>
          <Button disabled={true} variant="ghost" className="w-full flex-start gap-2">
            <SettingsIcon className="w-[20px] h-[20px]"/>
            <p className="prevent-text-select">Account Setting</p>
          </Button>
          <Separator/>
          <Button className="w-full prevent-text-select" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
