"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { ServiceEvent, ServiceSetlist, ServicePraiseTeam, ServiceFlow, ServiceFormState, ServiceRole } from "@/models/services/ServiceEvent";
import { ServiceDetailView } from "./service-detail-view";
import { Loader2 } from "lucide-react";

interface Props {
    serviceId: string;
    teamId: string;
    roles: ServiceRole[]; // Passed from page (fetched via ServiceEventApi or ServingService)
    currentUserUid?: string | null;
}

export function ServiceDetailContainer({ serviceId, teamId, roles, currentUserUid }: Props) {
    const [data, setData] = useState<{
        event: ServiceEvent;
        setlist: ServiceSetlist | null;
        praiseAssignee: ServicePraiseTeam | null;
        flow: ServiceFlow | null;
    } | null>(null);

    const [loading, setLoading] = useState(false);

    // Refetch function for use after form saves
    const refetchData = useCallback(async () => {
        if (!serviceId) return;
        try {
            const res = await ServiceEventApi.getServiceDetails(teamId, serviceId);
            setData(res);
        } catch (e) {
            console.error("Failed to refetch service details:", e);
        }
    }, [teamId, serviceId]);

    useEffect(() => {
        if (serviceId) {
            setLoading(true);
            ServiceEventApi.getServiceDetails(teamId, serviceId)
                .then(res => {
                    setData(res);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setData(null);
        }
    }, [serviceId, teamId]);

    // Prefetch members from both praiseAssignee and flow
    const memberIds = useMemo(() => {
        const ids: string[] = [];

        // Collect from praiseAssignee (praise_team)
        if (data?.praiseAssignee?.assignments) {
            ids.push(...data.praiseAssignee.assignments.flatMap(r => r.memberIds));
        }

        // Collect from flow items
        if (data?.flow?.items) {
            ids.push(...data.flow.items.flatMap(item =>
                item.assignments?.flatMap(a => a.memberIds) || []
            ));
        }

        // Return unique IDs (filter out group: prefixed items)
        return Array.from(new Set(ids)).filter(id => !id.startsWith('group:'));
    }, [data?.praiseAssignee, data?.flow]);

    // Recoil Suspense handling for members
    const members = useRecoilValue(usersAtom(memberIds));

    if (loading) {
        return (
            <div className="flex justify-center p-12" data-testid="service-loading">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <ServiceDetailView
            teamId={teamId}
            event={data.event}
            setlist={data.setlist}
            praiseAssignee={data.praiseAssignee}
            flow={data.flow}
            roles={roles}
            members={members}
            currentUserUid={currentUserUid}
            onDataChanged={refetchData}
        />
    );
}
