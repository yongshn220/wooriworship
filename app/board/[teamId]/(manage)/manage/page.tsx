"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState"
import { AuthApi, UserApi } from "@/apis"
import { Bell, BellOff, LogOut, Mail, Users, UserPlus, ChevronRight } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { auth } from "@/firebase"
import { pendingReceivedInvitationsAtom } from "@/global-states/invitation-state"
import { invitationInboxDialogOpenStateAtom } from "@/global-states/dialog-state"
import { MenuItem } from "@/app/board/[teamId]/(manage)/manage/_components/menu-item";
import { MenuGroup } from "@/app/board/[teamId]/(manage)/manage/_components/menu-group";
import { TeamProfileCard } from "@/app/board/[teamId]/(manage)/manage/_components/team-profile-card";
import { accountSettingAtom } from "@/global-states/account-setting"
import PushNotificationApi from "@/apis/PushNotificationApi"
import { TeamSelect } from "@/components/elements/design/team/team-select";
import { useState, useEffect } from "react";
import { InvitationDrawer } from "@/components/elements/manage/invitation-drawer";
import { useNotificationPermission } from "@/components/util/hook/use-notification-permission"
import { NotificationBlockedGuideDialog } from "@/components/elements/dialog/notification/notification-blocked-guide-dialog"
import useLocalStorage from "@/components/util/hook/use-local-storage"
import { userAtom, userUpdaterAtom } from "@/global-states/userState"
import { EditNameDialog } from "@/app/board/[teamId]/(manage)/manage/_components/edit-name-dialog"

export default function ManagePage({ params }: { params: { teamId: string } }) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const accountSetting = useRecoilValue(accountSettingAtom(authUser?.uid || ""))
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const setInvitationDialogState = useSetRecoilState(invitationInboxDialogOpenStateAtom)
  const [isInvitationDrawerOpen, setInvitationDrawerOpen] = useState(false)
  const { permission, requestPermission } = useNotificationPermission()
  const [blockedGuideOpen, setBlockedGuideOpen] = useState(false)
  const [utility] = useLocalStorage<{ deviceId: string }>('utility', { deviceId: '' })

  // Badge logic
  const pendingInvitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email || ""))
  const badgeCount = pendingInvitations?.length || 0

  const router = useRouter()

  const user = useRecoilValue(userAtom(authUser?.uid || ""))
  const setUserUpdater = useSetRecoilState(userUpdaterAtom)
  const [isEditNameDialogOpen, setEditNameDialogOpen] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  // Calculate user role
  const userRole = team?.admins?.includes(authUser?.uid || "")
    ? "Admin"
    : team?.users?.includes(authUser?.uid || "")
      ? "Member"
      : undefined

  useEffect(() => {
    async function syncVerificationStatus() {
      if (!authUser) return
      try {
        await authUser.reload()
        const verified = authUser.emailVerified
        setIsEmailVerified(verified)
        if (verified && user && !user.email_verified) {
          await UserApi.update(authUser.uid, { email_verified: true })
          setUserUpdater(prev => prev + 1)
        }
      } catch (error) {
        // Silently fail on reload error; use cached Firestore value
        if (user) {
          setIsEmailVerified(user.email_verified)
        }
      }
    }
    syncVerificationStatus()
  }, [authUser, user?.email_verified])

  async function handleSignOut() {
    try {
      await AuthApi.logout()
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

    await PushNotificationApi.updateOptState(authUser.uid, isEnabled)
  }

  async function handleRequestNotificationPermission() {
    const result = await requestPermission()
    if (result === "granted") {
      await updatePushNotificationOptState(true)
      if (authUser?.uid && utility.deviceId) {
        await PushNotificationApi.refreshSubscription(authUser.uid, utility.deviceId)
      }
      toast({ title: "Notifications enabled" })
    } else if (result === "denied") {
      toast({ title: "Notifications blocked", description: "You can enable them in your browser settings.", variant: "destructive" })
    }
  }

  async function handleUpdateName(newName: string) {
    if (!authUser?.uid) return
    try {
      await UserApi.updateName(authUser.uid, newName)
      setUserUpdater(prev => prev + 1)
      toast({ title: "Name updated successfully" })
      setEditNameDialogOpen(false)
    } catch (error) {
      toast({ title: "Failed to update name", variant: "destructive" })
      throw error  // re-throw so EditNameDialog knows save failed
    }
  }

  async function handleResendVerification() {
    if (!authUser) return
    setIsResending(true)
    try {
      await AuthApi.sendEmailVerification(authUser)
      toast({ title: "Verification email sent", description: "Please check your inbox." })
    } catch (error: any) {
      if (error?.code === "auth/too-many-requests") {
        toast({ title: "Too many requests", description: "Please wait before trying again.", variant: "destructive" })
      } else {
        toast({ title: "Failed to send email", description: "Please try again.", variant: "destructive" })
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-surface dark:bg-surface-dark overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-4 pt-2 pb-24">

        {/* Profile Section */}
        <TeamProfileCard
          name={team?.name}
          userName={user?.name}
          userEmail={authUser?.email || user?.email}
          userRole={userRole}
          isEmailVerified={isEmailVerified}
          onEditName={() => setEditNameDialogOpen(true)}
          onResendVerification={handleResendVerification}
          isResending={isResending}
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

        <EditNameDialog
          open={isEditNameDialogOpen}
          onOpenChange={setEditNameDialogOpen}
          currentName={user?.name || ""}
          onSave={handleUpdateName}
        />

        {/* Team Management Group */}
        <MenuGroup title="Team Management">
          <MenuItem
            icon={<Users className="w-[18px] h-[18px]" />}
            title="Team Members"
            description="Manage roles and permissions"
            showChevron
            onClick={() => router.push(`/board/${teamId}/manage/members`)}
          />

          <MenuItem
            icon={<UserPlus className="w-[18px] h-[18px]" />}
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
              icon={<Mail className="w-[18px] h-[18px]" />}
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
          {permission === "granted" ? (
            <MenuItem
              icon={<Bell className="w-[18px] h-[18px]" />}
              title="Push Notifications"
              description="Get notified about important updates"
              toggleId="push-notifications"
              onToggle={(state: boolean) => updatePushNotificationOptState(state)}
              toggleState={accountSetting?.push_notification?.is_enabled}
            />
          ) : permission === "default" ? (
            <MenuItem
              icon={<Bell className="w-[18px] h-[18px]" />}
              title="Push Notifications"
              description="Tap to enable notifications"
              showChevron
              onClick={handleRequestNotificationPermission}
            />
          ) : permission === "denied" ? (
            <MenuItem
              icon={<BellOff className="w-[18px] h-[18px]" />}
              title="Push Notifications"
              description="Notifications are blocked"
              showChevron
              onClick={() => setBlockedGuideOpen(true)}
              className="[&>div:first-child]:bg-amber-100 [&>div:first-child]:text-amber-600"
            />
          ) : (
            <MenuItem
              icon={<BellOff className="w-[18px] h-[18px]" />}
              title="Push Notifications"
              description="Not supported on this browser"
              className="opacity-50 pointer-events-none"
            />
          )}
        </MenuGroup>

        <NotificationBlockedGuideDialog
          open={blockedGuideOpen}
          onOpenChange={setBlockedGuideOpen}
        />

        {/* Account Group */}
        <MenuGroup title="Account">
          <MenuItem
            icon={<LogOut className="w-[18px] h-[18px]" />}
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
