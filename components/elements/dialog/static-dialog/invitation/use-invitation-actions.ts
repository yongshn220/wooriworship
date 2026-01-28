import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { InvitationApi, TeamApi, UserApi } from "@/apis";
import { InvitationStatus } from "@/components/constants/enums";
import { auth } from "@/firebase";
import { useSetRecoilState } from "recoil";
import { userUpdaterAtom } from "@/global-states/userState";
import { pendingReceivedInvitationsUpdaterAtom } from "@/global-states/invitation-state";
import { teamUpdaterAtom } from "@/global-states/teamState";
import { Invitation } from "@/models/invitation";
import { Team } from "@/models/team";

export function useInvitationActions() {
    const [isLoading, setIsLoading] = useState(false);
    const setUserUpdater = useSetRecoilState(userUpdaterAtom);
    const setInvitationsUpdater = useSetRecoilState(pendingReceivedInvitationsUpdaterAtom);
    const setTeamUpdater = useSetRecoilState(teamUpdaterAtom);

    async function handleAccept(invitation: Invitation, team: Team) {
        const user = auth.currentUser;
        if (!user) return;
        setIsLoading(true);

        try {
            const promises = [
                InvitationApi.updateInvitation(team.id, invitation.id, InvitationStatus.Accepted),
                UserApi.addNewTeam(user.uid, team.id),
                TeamApi.addNewMember(user.uid, team.id)
            ];
            const [invitationUpdateResult, addNewTeamResult, addNewMemberResult] = await Promise.all(promises);

            if (!addNewTeamResult || !addNewMemberResult) {
                toast({ title: "Failed to accept the team. Please try later again." });
                return false;
            } else {
                toast({ title: `You have successfully joined [${team.name}]` });

                // Update states
                setUserUpdater(prev => prev + 1);
                setInvitationsUpdater(prev => prev + 1);
                setTeamUpdater(prev => prev + 1);
                return true;
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Oops, Something went wrong." });
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDecline(invitation: Invitation, team: Team) {
        setIsLoading(true);
        try {
            const result = await InvitationApi.updateInvitation(team.id, invitation.id, InvitationStatus.Rejected);
            if (!result) {
                toast({ title: `Fail to declined the invitation. Please try later again.` });
                return false;
            }

            toast({ title: `You declined invitation from [${team.name}]` });
            setInvitationsUpdater(prev => prev + 1);
            return true;
        } catch (err) {
            console.error(err);
            toast({ title: "Oops, Something went wrong." });
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        handleAccept,
        handleDecline,
        isLoading
    };
}
