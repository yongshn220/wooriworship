"use client";

import { useEffect, useState, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { ServiceEvent, ServiceSetlist, ServicePraiseAssignee, ServiceFlow, ServiceFormState, ServiceRole } from "@/models/services/ServiceEvent";
import { ServiceDetailViewV3 } from "./service-detail-view-v3";
import { Loader2 } from "lucide-react";

interface Props {
    serviceId: string;
    teamId: string;
    roles: ServiceRole[]; // Passed from page (fetched via ServiceEventService or ServingService)
    currentUserUid?: string | null;
}

export function ServiceDetailContainerV3({ serviceId, teamId, roles, currentUserUid }: Props) {
    const [data, setData] = useState<{
        event: ServiceEvent;
        setlist: ServiceSetlist | null;
        praiseAssignee: ServicePraiseAssignee | null;
        flow: ServiceFlow | null;
    } | null>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (serviceId) {
            setLoading(true);
            ServiceEventService.getServiceDetails(teamId, serviceId)
                .then(res => {
                    setData(res);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setData(null);
        }
    }, [serviceId, teamId]);

    // Prefetch members
    const memberIds = useMemo(() => {
        if (!data?.praiseAssignee?.assignee) return [];
        return data.praiseAssignee.assignee.flatMap(r => r.memberIds);
    }, [data?.praiseAssignee]);

    // Recoil Suspense handling for members
    const members = useRecoilValue(usersAtom(memberIds));

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data) return null;

    // V3 View
    return (
        <ServiceDetailViewV3
            teamId={teamId}
            event={data.event}
            setlist={data.setlist}
            praiseAssignee={data.praiseAssignee}
            flow={data.flow}
            roles={roles}
            members={members}
            currentUserUid={currentUserUid}
        />
    );
}
