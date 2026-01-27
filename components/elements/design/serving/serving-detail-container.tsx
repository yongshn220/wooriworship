"use client";

import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServingSchedule, ServingRole } from "@/models/serving";
import { ServingDetailView } from "./serving-detail-view";
import { useMemo } from "react";
import { useServingMemberIds } from "@/app/board/[teamId]/(service)/service-board/_hooks/use-serving-member-ids";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    teamId: string;
    currentUserUid?: string | null;
}

export function ServingDetailContainer({ schedule, roles, teamId, currentUserUid }: Props) {
    // Fetch members only for the selected schedule
    const allMemberIds = useServingMemberIds(schedule);

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
