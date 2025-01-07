"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {currentTeamIdAtom, teamAtom} from "@/global-states/teamState"
import { AuthService } from "@/apis"
import { LogOut, MailIcon, Settings, Users } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { auth } from "@/firebase"
import { pendingReceivedInvitationsAtom } from "@/global-states/invitation-state"
import { invitationInboxDialogOpenStateAtom } from "@/global-states/dialog-state"
import {TeamIcon} from "@/components/team-icon";
import {ManageTeamDialog} from "@/components/dialog/manage-team/manage-team-dialog";

export default function ManagePage({ params }: { params: { teamId: string } }) {
  const authUser = auth.currentUser
  const teamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(teamId))
  const setCurrentTeamId = useSetRecoilState(currentTeamIdAtom)
  const invitations = useRecoilValue(pendingReceivedInvitationsAtom(authUser?.email))
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

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow flex flex-col justify-between">
        <div className="flex items-center space-x-4 p-4  rounded-lg mb-4">
          <TeamIcon name={team?.name}></TeamIcon>
          <div>
            <p className="text-sm font-medium">Current Team</p>
            <h2 className="text-lg font-bold">{team?.name}</h2>
          </div>
        </div>

        <ManageTeamDialog>
          <Button variant="ghost" className="w-full justify-start text-lg py-8">
            <Users className="mr-4 h-6 w-6" />
            Manage Team
          </Button>
        </ManageTeamDialog>

        <Separator/>

        <Button variant="ghost" className="w-full justify-start text-lg py-8" onClick={() => setInvitationDialogState(true)}>
          <MailIcon className="mr-4 h-6 w-6"/>
          {
            invitations?.length > 0 &&
            <div className="rounded-full bg-red-500 w-5 h-5 text-white">{invitations?.length}</div>
          }
          Invitation Inbox
        </Button>

        <Separator/>

        <Button disabled variant="ghost" className="w-full justify-start text-lg py-8">
          <Settings className="mr-4 h-6 w-6" />
          Account Settings
        </Button>

        <Separator/>


        <div className="mt-auto">
          <Separator className="my-6" />
          <div className="flex-center w-full">
            <Button className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-4 h-6 w-6" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

