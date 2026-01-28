"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { InvitationApi } from "@/apis";
import { auth } from "@/firebase";
import { toast } from "@/components/ui/use-toast";
import { sentInvitationsAtom, sentInvitationsUpdaterAtom } from "@/global-states/invitation-state";
import { usersAtom } from "@/global-states/userState";
import { InvitationStatus } from "@/components/constants/enums";
import { StatusCodes } from 'http-status-codes';
import { UserPlusIcon, Mail, ChevronLeft } from "lucide-react";
import { PendingMember } from "@/components/elements/dialog/manage-team/pending-member";
import { useRouter } from "next/navigation";

export default function InvitationsPage() {
    const router = useRouter();
    const authUser = auth.currentUser;
    const currentTeamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(currentTeamId));
    const members = useRecoilValue(usersAtom(team?.users));
    const sentInvitations = useRecoilValue(sentInvitationsAtom({ userId: authUser?.uid, teamId: team?.id }));
    const setSentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom);

    const [receiverEmail, setReceiverEmail] = useState("");
    const [isAddPeopleLoading, setAddPeopleLoading] = useState(false);

    const pendingInvitations = useMemo(() => sentInvitations.filter((invitation) => invitation.invitation_status !== InvitationStatus.Accepted), [sentInvitations]);

    function handleAddPeople() {
        setAddPeopleLoading(true);

        if (isAddPeopleLoading) {
            toast({ description: "Invitation is on processing." });
            return;
        }

        try {
            if (receiverEmail.toLowerCase() == authUser?.email.toLowerCase()) {
                toast({ title: "Can't send invitation", description: "You can't send an invitation to yourself." });
                setAddPeopleLoading(false);
                return;
            }

            if (members.map(m => m.email.toLowerCase()).includes(receiverEmail.toLowerCase())) {
                toast({ title: "Can't send invitation", description: "The following user is already the team member." });
                setAddPeopleLoading(false);
                return;
            }

            InvitationApi.createInvitation(authUser?.uid, authUser?.email, currentTeamId, team?.name, receiverEmail.toLowerCase()).then(invitationId => {
                if (!invitationId) {
                    toast({ title: "Can't send invitation", description: "The following user set up a restriction on team invitation or email." });
                    setAddPeopleLoading(false);
                    return;
                }

                setReceiverEmail("");
                toast({ title: "Successfully sent the invitation.", description: `Invitation email has sent to ${receiverEmail}` });
                setSentInvitationsUpdater(prev => prev + 1);
                setAddPeopleLoading(false);

            }).catch((e) => {
                if (e.status === StatusCodes.UNPROCESSABLE_ENTITY) {
                    toast({ title: "Send fail", description: "Email structure is invalid. Please check the email.", variant: "destructive" });
                }
                else {
                    toast({ title: "Something went wrong. Please contact us.", variant: "destructive" });
                }
                setAddPeopleLoading(false);
            });
        }
        catch (e) {
            console.log(e, "manage-team-button/handleAddPeople");
            toast({ title: "Something went wrong. Please contact us." });
        }
    }

    return (
        <div className="flex flex-col w-full h-full bg-background min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-background px-4 h-14 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold">Invitation Inbox</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-6">

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
        </div>
    );
}
