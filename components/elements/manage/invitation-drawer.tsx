"use client";

import { useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { InvitationService } from "@/apis";
import { auth } from "@/firebase";
import { toast } from "@/components/ui/use-toast";
import { sentInvitationsAtom, sentInvitationsUpdaterAtom } from "@/global-states/invitation-state";
import { usersAtom } from "@/global-states/userState";
import { InvitationStatus } from "@/components/constants/enums";
import { StatusCodes } from 'http-status-codes';
import { UserPlusIcon, Mail, Send } from "lucide-react";
import { PendingMember } from "@/components/elements/dialog/manage-team/pending-member";

import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InvitationDrawer({ open, onOpenChange }: Props) {
    const authUser = auth.currentUser;
    const currentTeamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(currentTeamId));
    const members = useRecoilValue(usersAtom(team?.users));
    const sentInvitations = useRecoilValue(sentInvitationsAtom({ userId: authUser?.uid, teamId: team?.id }));
    const setSentInvitationsUpdater = useSetRecoilState(sentInvitationsUpdaterAtom);

    const [receiverEmail, setReceiverEmail] = useState("");
    const [isAddPeopleLoading, setAddPeopleLoading] = useState(false);

    const pendingInvitations = useMemo(() => sentInvitations.filter((invitation) => invitation.invitation_status !== InvitationStatus.Accepted), [sentInvitations]);

    async function handleAddPeople() {
        if (!receiverEmail) return;

        setAddPeopleLoading(true);

        if (isAddPeopleLoading) {
            toast({ description: "Invitation is on processing." });
            return;
        }

        try {
            if (receiverEmail.toLowerCase() == authUser?.email?.toLowerCase()) {
                toast({ title: "Can't send invitation", description: "You can't send an invitation to yourself." });
                setAddPeopleLoading(false);
                return;
            }

            if (members.map(m => m.email.toLowerCase()).includes(receiverEmail.toLowerCase())) {
                toast({ title: "Can't send invitation", description: "The following user is already the team member." });
                setAddPeopleLoading(false);
                return;
            }

            const invitationId = await InvitationService.createInvitation(authUser?.uid, authUser?.email, currentTeamId, team?.name, receiverEmail.toLowerCase());

            if (!invitationId) {
                toast({ title: "Can't send invitation", description: "The following user set up a restriction on team invitation or email." });
                setAddPeopleLoading(false);
                return;
            }

            setReceiverEmail("");
            toast({ title: "Successfully sent the invitation.", description: `Invitation email has sent to ${receiverEmail}` });
            setSentInvitationsUpdater(prev => prev + 1);
            setAddPeopleLoading(false);

        } catch (e: any) {
            console.error(e, "manage-team-button/handleAddPeople");
            if (e.status === StatusCodes.UNPROCESSABLE_ENTITY) {
                toast({ title: "Send fail", description: "Email structure is invalid. Please check the email.", variant: "destructive" });
            } else {
                toast({ title: "Something went wrong. Please contact us.", variant: "destructive" });
            }
            setAddPeopleLoading(false);
        }
    }

    return (
        <ResponsiveDrawer
            open={open}
            onOpenChange={onOpenChange}
            title="Invite New Member"
            description="Send email invitations to bring people to your team."
            className="h-[70vh]"
        >
            <div className="flex flex-col gap-6 pb-6 pt-2 h-full">

                {/* Invite Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                value={receiverEmail}
                                onChange={(e) => setReceiverEmail(e.target.value)}
                                className="bg-background"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && receiverEmail) {
                                        handleAddPeople();
                                    }
                                }}
                            />
                            <Button
                                disabled={isAddPeopleLoading || !receiverEmail}
                                onClick={handleAddPeople}
                                size="icon"
                                className="shrink-0"
                            >
                                {isAddPeopleLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                            They will receive an email with a link to join this team.
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Pending List */}
                <div className="flex flex-col gap-3 flex-1 min-h-0">
                    <div className="flex items-center justify-between shrink-0">
                        <Label className="uppercase text-xs text-muted-foreground font-semibold tracking-wider">
                            Pending Invitations
                        </Label>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                            {pendingInvitations.length}
                        </span>
                    </div>


                    {pendingInvitations?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 bg-muted/20 rounded-xl border border-dashed h-40">
                            <Mail className="w-8 h-8 text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">No pending invitations</p>
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border shadow-sm divide-y flex-1 overflow-y-auto min-h-0">
                            {pendingInvitations?.map((invitation) => (
                                <PendingMember key={invitation?.id} invitation={invitation} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ResponsiveDrawer>
    );
}
