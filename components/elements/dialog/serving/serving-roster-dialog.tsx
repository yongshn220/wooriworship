"use client";

import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { fetchServingRolesSelector } from "@/global-states/servingState";
import { teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { ServingSchedule } from "@/models/serving";
import { useEffect, useState } from "react";
import { ServingService } from "@/apis";
import { Spinner } from "@/components/ui/spinner";
import { ClipboardList } from "lucide-react";
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { ServingMemberList } from "@/components/elements/design/serving/serving-member-list";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

interface Props {
    date: string; // YYYY-MM-DD
    teamId: string;
    trigger?: React.ReactNode;
}

export function ServingRosterDialog({ date, teamId, trigger }: Props) {
    const [schedule, setSchedule] = useState<ServingSchedule | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user] = useAuthState(auth as any);

    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));

    useEffect(() => {
        if (isOpen && teamId && date) {
            setLoading(true);
            ServingService.getScheduleByDate(teamId, date)
                .then(setSchedule)
                .finally(() => setLoading(false));
        }
    }, [isOpen, teamId, date]);

    const getMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || "Unknown";

    return (
        <ResponsiveDrawer
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={trigger || (
                <div className="flex items-center gap-2 text-primary cursor-pointer hover:underline text-sm font-medium">
                    <ClipboardList className="h-4 w-4" />
                    Serving Members
                </div>
            )}
            title="Serving Members"
            description={format(new Date(date), "MMMM d, yyyy")}
        >
            <div className="flex-1 space-y-1">
                {loading ? (
                    <div className="flex justify-center p-8"><Spinner /></div>
                ) : !schedule ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No roster assigned for this date.
                    </div>
                ) : (
                    <div className="space-y-1">
                        <ServingMemberList
                            schedule={schedule}
                            roles={roles}
                            members={teamMembers}
                            currentUserUid={user?.uid}
                        />
                    </div>
                )}
            </div>
        </ResponsiveDrawer>
    );
}
