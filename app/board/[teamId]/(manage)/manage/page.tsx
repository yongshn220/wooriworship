"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState"
import { AuthService } from "@/apis"
import {Bell, LogOut, Mail, MailIcon, Settings, Users} from 'lucide-react'
import { useRouter } from "next/navigation"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { auth } from "@/firebase"
import { pendingReceivedInvitationsAtom } from "@/global-states/invitation-state"
import { invitationInboxDialogOpenStateAtom } from "@/global-states/dialog-state"
import {TeamIcon} from "@/components/elements/design/team/team-icon";
import {ManageTeamDialog} from "@/components/elements/dialog/manage-team/manage-team-dialog";
import {MenuItem} from "@/app/board/[teamId]/(manage)/manage/_components/menu-item";
import { accountSettingAtom } from "@/global-states/account-setting"
import PushNotificationService from "@/apis/PushNotificationService"

export default function ManagePage({ params }: { params: { teamId: string } }) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const accountSetting = useRecoilValue(accountSettingAtom(authUser?.uid))
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const setInvitationDialogState = useSetRecoilState(invitationInboxDialogOpenStateAtom)

  const router = useRouter()


  async function handleSignOut() {
    try {
      await AuthService.logout()
      setCurrentTeamId(null)
      toast({ title: "Goodbye :)" })
      router.replace("/")
    }
    catch (err: any) {
      console.error("Logout error:", err.code)
      toast({ title: "Error signing out", description: "Please try again.", variant: "destructive" })
    }
  }

  async function updatePushNotificationOptState(isEnabled: boolean) {
    if (!authUser?.uid) return;
    
    await PushNotificationService.updateOptState(authUser.uid, isEnabled)
  }


  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow flex flex-col justify-between">
        <div className="flex items-center space-x-4 p-4  rounded-lg mb-4">
          <TeamIcon name={team?.name}></TeamIcon>
          <div>
            <div>
              <div className="font-medium">Current Team</div>
              <div className="text-sm text-muted-foreground">{team?.name}</div>
            </div>
          </div>
        </div>

        <ManageTeamDialog>
          <MenuItem
            icon={<Users className="h-5 w-5 text-primary"/>}
            title="Manage Team"
            description="Add or remove team members"
          />
        </ManageTeamDialog>

        <div onClick={() => setInvitationDialogState(true)}>
          <MenuItem
            icon={<Mail className="h-5 w-5 text-primary"/>}
            title="Invitation Inbox"
            description="Manage team invitations"
          />
        </div>

        <MenuItem
          icon={<Bell className="h-5 w-5 text-primary"/>}
          title="Push Notifications"
          description="Get notified about important updates"
          toggleId="push-notifications"
          onToggle={(state: boolean) => updatePushNotificationOptState(state)}
          toggleState={accountSetting?.push_notification?.is_enabled}
        />

        <div className="mt-auto">
          <Separator className="my-6"/>
          <div className="flex-center w-full">
            <Button className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-4 h-6 w-6"/>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

