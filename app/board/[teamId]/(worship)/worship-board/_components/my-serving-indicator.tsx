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
                const myRoles = schedule.roles.filter(r => r.memberIds.includes(authUser.uid));
                setIsServing(myRoles.length > 0);
            }
        });
    }, [teamId, date, authUser]);

    if (!isServing) return null;

    return (
        <Badge variant="outline" className="border-primary text-primary bg-primary/5 text-xs">
            My Serving
        </Badge>
    );
}
