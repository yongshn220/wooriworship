import {Drawer, DrawerContent, DrawerHeader, DrawerTrigger,} from "@/components/ui/drawer"
import {PlusCircleIcon, SettingsIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {AuthService} from "@/apis";
import {toast} from "@/components/ui/use-toast";
import {auth} from "@/firebase";
import {useRecoilValue} from "recoil";
import {userAtom} from "@/global-states/userState";
import {useRouter} from "next/navigation";
import {InvitationButton} from "@/app/board/_components/nav-bar/invitation-button";
import {Separator} from "@/components/ui/separator";

export function SettingButton() {
  const authUser = auth.currentUser
  const user = useRecoilValue(userAtom(authUser?.uid))
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
    <Drawer>
      <DrawerTrigger className="flex-center flex-col">
        <SettingsIcon/>
        <p className="text-sm">Setting</p>
      </DrawerTrigger>
      <DrawerContent className="w-full min-h-[240px]">
        <DrawerHeader>
          <p className="font-semibold">Wooriworship</p>
        </DrawerHeader>
        <div className="w-full h-full flex-center flex-col gap-4 p-2">
          <InvitationButton/>
          <Button disabled={true} variant="ghost" className="w-full flex-start gap-2">
            <SettingsIcon className="w-[20px] h-[20px]"/>
            <p>Account Setting</p>
          </Button>
          <Separator/>
          <Button className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
