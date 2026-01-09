"use client";

import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServingSchedule, ServingRole } from "@/models/serving";
import { ServingDetailView } from "./serving-detail-view";
import { useMemo } from "react";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    teamId: string;
    currentUserUid?: string | null;
}

export function ServingDetailContainer({ schedule, roles, teamId, currentUserUid }: Props) {
    // Fetch members only for the selected schedule
    const allMemberIds = useMemo(() => {
        if (!schedule) return [];
        return [
            ...(schedule.items?.flatMap(item => item.assignments.flatMap(a => a.memberIds)) || []),
            ...(schedule.worship_roles?.flatMap(a => a.memberIds) || []),
            ...(schedule.roles?.flatMap(r => r.memberIds) || [])
        ];
    }, [schedule]);

    //Suspense will trigger here if data is not ready
    const members = useRecoilValue(usersAtom(allMemberIds));

    return (
        <ServingDetailView
            schedule={schedule}
            roles={roles}
            members={members}
            currentUserUid={currentUserUid}
            teamId={teamId}
        />
    );
}
