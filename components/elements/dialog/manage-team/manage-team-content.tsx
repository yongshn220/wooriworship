"use client"

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense, useMemo, useState } from "react";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { InvitationService } from "@/apis";
import { auth } from "@/firebase";
import { toast } from "@/components/ui/use-toast";
import { sentInvitationsAtom, sentInvitationsUpdaterAtom } from "@/global-states/invitation-state";
import { usersAtom } from "@/global-states/userState";
import { InvitationStatus } from "@/components/constants/enums";
import { StatusCodes } from 'http-status-codes';
import { TeamSelect } from "@/components/elements/design/team/team-select";
import { UserPlusIcon, Users, Mail } from "lucide-react";
import { PendingMember } from "@/components/elements/dialog/manage-team/pending-member";
import { InvitedMember } from "@/components/elements/dialog/manage-team/invited-member";
import { ManageTeamMenu } from "@/components/elements/dialog/manage-team/manage-team-menu";
import { cn } from "@/lib/utils";

type Tab = "members" | "invitations"

export function ManageTeamContent() {
  const authUser = auth.currentUser
  const currentTeamId = useRecoilValue(currentTeamIdAtom)
  const team = useRecoilValue(teamAtom(currentTeamId))
  const members = useRecoilValue(usersAtom(team?.users))
  const sentInvitations = useRecoilValue(sentInvitationsAtom({ userId: authUser?.uid, teamId: team?.id }))
  const setSentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom)

  const [receiverEmail, setReceiverEmail] = useState("")
  const [isAddPeopleLoading, setAddPeopleLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("members")

  const pendingInvitations = useMemo(() => sentInvitations.filter((invitation) => invitation.invitation_status !== InvitationStatus.Accepted), [sentInvitations])

  function handleAddPeople() {
    setAddPeopleLoading(true)

    if (isAddPeopleLoading) {
      toast({ description: "Invitation is on processing." });
      return;
    }

    try {
      if (receiverEmail.toLowerCase() == authUser?.email.toLowerCase()) {
        toast({ title: "Can't send invitation", description: "You can't send an invitation to yourself." });
        setAddPeopleLoading(false)
        return;
      }

      if (members.map(m => m.email.toLowerCase()).includes(receiverEmail.toLowerCase())) {
        toast({ title: "Can't send invitation", description: "The following user is already the team member." })
        setAddPeopleLoading(false)
        return;
      }

      InvitationService.createInvitation(authUser?.uid, authUser?.email, currentTeamId, team?.name, receiverEmail.toLowerCase()).then(invitationId => {
        if (!invitationId) {
          toast({ title: "Can't send invitation", description: "The following user set up a restriction on team invitation or email." })
          setAddPeopleLoading(false)
          return;
        }

        setReceiverEmail("")
        toast({ title: "Successfully sent the invitation.", description: `Invitation email has sent to ${receiverEmail}` })
        setSentInvitationsUpdater(prev => prev + 1)
        setAddPeopleLoading(false)

      }).catch((e) => {
        if (e.status === StatusCodes.UNPROCESSABLE_ENTITY) {
          toast({ title: "Send fail", description: "Email structure is invalid. Please check the email.", variant: "destructive" })
        }
        else {
          toast({ title: "Something went wrong. Please contact us.", variant: "destructive" })
        }
        setAddPeopleLoading(false)
      });
    }
    catch (e) {
      console.log(e, "manage-team-button/handleAddPeople")
      toast({ title: "Something went wrong. Please contact us." })
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="w-full border-b bg-background sticky top-0 z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xl font-semibold">Manage Team</p>
          <div className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <ManageTeamMenu />
          </div>
        </div>

        <div className="w-full flex justify-center mb-6">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-md" />}>
            <TeamSelect createOption={true} />
          </Suspense>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-lg mb-2">
          <button
            onClick={() => setActiveTab("members")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
              activeTab === "members"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Members
            <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {team?.users.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
              activeTab === "invitations"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <Mail className="w-4 h-4" />
            Invitations
            {pendingInvitations?.length > 0 && (
              <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                {pendingInvitations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider pl-1">
                Active Members
              </Label>
              <div className="bg-card rounded-xl border shadow-sm divide-y">
                {team?.users?.map((userId) => (
                  <InvitedMember key={userId} userId={userId} teamId={currentTeamId} />
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Manage member roles and permissions by tapping on a user.
              </p>
            </div>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Invite Box */}
            <div className="space-y-3">
              <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider pl-1">
                Invite New Member
              </Label>
              <div className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                <p className="text-sm text-muted-foreground">
                  Send an invitation email to add a new member.
                </p>
                <div className="flex flex-col gap-3">
                  <Input
                    placeholder="Enter email address"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    className="bg-background"
                  />
                  <Button
                    disabled={isAddPeopleLoading || !receiverEmail}
                    className="w-full gap-2"
                    onClick={handleAddPeople}
                  >
                    {isAddPeopleLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <UserPlusIcon className="w-4 h-4" /> Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Pending List */}
            <div className="space-y-2">
              <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider pl-1">
                Pending Invitations ({pendingInvitations?.length})
              </Label>

              {pendingInvitations?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-xl border border-dashed">
                  <Mail className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No pending invitations</p>
                </div>
              ) : (
                <div className="bg-card rounded-xl border shadow-sm divide-y">
                  {pendingInvitations?.map((invitation) => (
                    <PendingMember key={invitation?.id} invitation={invitation} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
