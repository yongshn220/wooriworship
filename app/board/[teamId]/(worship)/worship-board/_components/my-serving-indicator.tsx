"use client";

import { useEffect, useState } from "react";
import { ServingService } from "@/apis";
import { auth } from "@/firebase";
import { Badge } from "@/components/ui/badge";
import { ServingSchedule } from "@/models/serving";

export function MyServingIndicator({ teamId, date }: { teamId: string, date: string }) {
    const [isServing, setIsServing] = useState(false);
    const authUser = auth.currentUser;

    useEffect(() => {
        if (!teamId || !date || !authUser) return;
        ServingService.getScheduleByDate(teamId, date).then((schedule) => {
            if (schedule) {
                const inRoles = (schedule.roles || []).some(r => r.memberIds.includes(authUser.uid));
                const inItems = (schedule.items || []).some(item =>
                    (item.assignments || []).some(assign => assign.memberIds.includes(authUser.uid))
                );
                setIsServing(inRoles || inItems);
            }
        });
    }, [teamId, date, authUser]);

    if (!isServing) return null;

    return (
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-0 text-xs font-medium px-2 py-0.5">
            My Serving
        </Badge>
    );
}
