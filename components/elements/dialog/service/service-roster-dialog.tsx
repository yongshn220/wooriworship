"use client";

import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { fetchServingRolesSelector } from "@/global-states/serviceRolesState";
import { teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { ServiceFormState } from "@/models/services/ServiceEvent";
import { useEffect, useState } from "react";
import { formatToLongDate } from "@/components/util/helper/helper-functions";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { Spinner } from "@/components/ui/spinner";
import { ClipboardList } from "lucide-react";
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { PraiseTeamCard } from "@/components/elements/design/service/parts/praise-team-card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

interface Props {
    date: string; // YYYY-MM-DD
    teamId: string;
    trigger?: React.ReactNode;
}

export function ServiceRosterDialog({ date, teamId, trigger }: Props) {
    const [schedule, setSchedule] = useState<ServiceFormState | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user] = useAuthState(auth as any);

    const team = useRecoilValue(teamAtom(teamId));
    const teamMembers = useRecoilValue(usersAtom(team?.users));
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));

    useEffect(() => {
        if (isOpen && teamId && date) {
            setLoading(true);
            ServiceEventService.getServiceByDate(teamId, date)
                .then((res) => setSchedule(res as any))
                .finally(() => setLoading(false));
        }
    }, [isOpen, teamId, date]);

    const getMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || id;

    const getDialogTitle = () => {
        if (!schedule || !team?.service_tags) return "Serving Members";
        const tagIds = schedule.service_tags || [];
        if (tagIds.length === 0) return "Serving Members";
        const tagName = team.service_tags.find((t: any) => t.id === tagIds[0])?.name;
        return tagName || "Serving Members";
    };

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
            title={getDialogTitle()}
            description={formatToLongDate(date)}
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
                        <PraiseTeamCard
                            praiseAssignments={schedule.worship_roles || schedule.roles || []}
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
