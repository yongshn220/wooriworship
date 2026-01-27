"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState"
import { AuthService } from "@/apis"
import { Bell, LogOut, Mail, MailIcon, Settings, Users, UserPlus } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { auth } from "@/firebase"
import { pendingReceivedInvitationsAtom } from "@/global-states/invitation-state"
import { invitationInboxDialogOpenStateAtom } from "@/global-states/dialog-state"
import { TeamIcon } from "@/components/elements/design/team/team-icon";
import { MenuItem } from "@/app/board/[teamId]/(manage)/manage/_components/menu-item";
import { MenuGroup } from "@/app/board/[teamId]/(manage)/manage/_components/menu-group";
import { TeamProfileCard } from "@/app/board/[teamId]/(manage)/manage/_components/team-profile-card";
import { accountSettingAtom } from "@/global-states/account-setting"
import PushNotificationService from "@/apis/PushNotificationService"
import { TeamSelect } from "@/components/elements/design/team/team-select";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { InvitationDrawer } from "@/components/elements/manage/invitation-drawer";

export default function ManagePage({ params }: { params: { teamId: string } }) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const accountSetting = useRecoilValue(accountSettingAtom(authUser?.uid || ""))
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const setInvitationDialogState = useSetRecoilState(invitationInboxDialogOpenStateAtom)
  const [isInvitationDrawerOpen, setInvitationDrawerOpen] = useState(false)

  // Badge logic
  const pendingInvitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email || ""))
  const badgeCount = pendingInvitations?.length || 0

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
    <div className="flex flex-col w-full h-full bg-muted/30 overflow-y-auto">
      <div className="w-full pb-10">

        {/* Profile Section */}
        <TeamProfileCard
          name={team?.name}
          action={
            <TeamSelect
              createOption={true}
              onTeamChange={(newTeamId) => router.replace(`/board/${newTeamId}/manage`)}
              customTrigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 px-4 text-xs font-medium"
                >
                  Switch Team
                  <ChevronRight className="w-3 h-3 ml-1 opacity-50" />
                </Button>
              }
            />
          }
        />

        {/* Team Management Group */}
        <MenuGroup title="Team Management">
          <MenuItem
            icon={<Users className="h-5 w-5" />}
            title="Team Members"
            description="Manage roles and permissions"
            showChevron
            onClick={() => router.push(`/board/${teamId}/manage/members`)}
          />

          <MenuItem
            icon={<UserPlus className="h-5 w-5" />}
            title="Invite Members"
            description="Send team invitations"
            showChevron
            onClick={() => setInvitationDrawerOpen(true)}
          />

          <InvitationDrawer
            open={isInvitationDrawerOpen}
            onOpenChange={setInvitationDrawerOpen}
          />

          <div onClick={() => setInvitationDialogState(true)}>
            <MenuItem
              icon={<Mail className="h-5 w-5" />}
              title="Invitation Inbox"
              description="Manage team invitations"
              badge={badgeCount > 0 ? badgeCount : undefined}
              showChevron
              onClick={() => setInvitationDialogState(true)}
            />
          </div>
        </MenuGroup>

        {/* App Settings Group */}
        <MenuGroup title="App Settings">
          <MenuItem
            icon={<Bell className="h-5 w-5" />}
            title="Push Notifications"
            description="Get notified about important updates"
            toggleId="push-notifications"
            onToggle={(state: boolean) => updatePushNotificationOptState(state)}
            toggleState={accountSetting?.push_notification?.is_enabled}
          />
        </MenuGroup>

        {/* Account Group */}
        <MenuGroup title="Account">
          <MenuItem
            icon={<LogOut className="h-5 w-5" />}
            title="Sign Out"
            onClick={handleSignOut}
            variant="destructive"
          />
        </MenuGroup>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Version 1.0.0
          </p>
        </div>

      </div>
    </div>
  )
}

