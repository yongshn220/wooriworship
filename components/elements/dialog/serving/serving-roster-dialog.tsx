"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { servingRolesAtom, fetchServingRolesSelector } from "@/global-states/servingState";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { ServingSchedule } from "@/models/serving";
import { useEffect, useState } from "react";
import { ServingService } from "@/apis";
import { Spinner } from "@/components/ui/spinner";
import { ClipboardList } from "lucide-react";

interface Props {
    date: string; // YYYY-MM-DD
    teamId: string;
    trigger?: React.ReactNode;
}

export function ServingRosterDialog({ date, teamId, trigger }: Props) {
    const [schedule, setSchedule] = useState<ServingSchedule | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <div className="flex items-center gap-2 text-primary cursor-pointer hover:underline text-sm font-medium">
                        <ClipboardList className="h-4 w-4" />
                        Service Members
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Serving Roster</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(date), "MMMM d, yyyy")}
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-1">
                    {loading ? (
                        <div className="flex justify-center p-8"><Spinner /></div>
                    ) : !schedule ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No roster assigned for this date.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {roles.map(role => {
                                const assigned = schedule.roles.find(r => r.roleId === role.id);
                                if (!assigned || assigned.memberIds.length === 0) return null;

                                return (
                                    <div key={role.id} className="flex flex-col p-3 rounded-lg border bg-card">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">{role.name}</span>
                                        <div className="mt-1 font-medium text-foreground">
                                            {assigned.memberIds.map(uid => getMemberName(uid)).join(", ")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
