"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { usersAtom } from "@/global-states/userState";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { ServiceRole } from "@/models/services/ServiceEvent";
import { MyAssignmentRole } from "@/models/services/MyAssignment";
import { ServiceDetailView } from "./service-detail-view";
import { Loader2 } from "lucide-react";
import { serviceDetailCacheAtom, serviceDetailLoadingAtom } from "@/global-states/serviceEventState";

interface Props {
    serviceId: string;
    teamId: string;
    roles: ServiceRole[];
    currentUserUid?: string | null;
    myRoles?: MyAssignmentRole[];
}

export function ServiceDetailContainer({ serviceId, teamId, roles, currentUserUid, myRoles }: Props) {
    const [cachedData, setCachedData] = useRecoilState(serviceDetailCacheAtom(serviceId));
    const [loading, setLoading] = useRecoilState(serviceDetailLoadingAtom(serviceId));

    // Fetch data only if not cached
    useEffect(() => {
        if (!serviceId) return;

        // Skip if already cached
        if (cachedData) return;

        // Skip if already loading
        if (loading) return;

        setLoading(true);
        ServiceEventApi.getServiceDetails(teamId, serviceId)
            .then(res => {
                setCachedData(res);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [serviceId, teamId, cachedData, loading, setCachedData, setLoading]);

    // Refetch function for use after form saves (invalidates cache)
    const refetchData = useCallback(async () => {
        if (!serviceId) return;
        setLoading(true);
        try {
            const res = await ServiceEventApi.getServiceDetails(teamId, serviceId);
            setCachedData(res);
        } catch (e) {
            console.error("Failed to refetch service details:", e);
        } finally {
            setLoading(false);
        }
    }, [teamId, serviceId, setCachedData, setLoading]);

    // Prefetch members from both praiseAssignee and flow
    const memberIds = useMemo(() => {
        const ids: string[] = [];

        if (cachedData?.praiseAssignee?.assignments) {
            ids.push(...cachedData.praiseAssignee.assignments.flatMap(r => r.memberIds));
        }

        if (cachedData?.flow?.items) {
            ids.push(...cachedData.flow.items.flatMap(item =>
                item.assignments?.flatMap(a => a.memberIds) || []
            ));
        }

        return Array.from(new Set(ids)).filter(id => !id.startsWith('group:'));
    }, [cachedData?.praiseAssignee, cachedData?.flow]);

    const members = useRecoilValue(usersAtom(memberIds));

    // Show loading only on first load (not cached)
    if (loading && !cachedData) {
        return (
            <div className="flex justify-center p-12" data-testid="service-loading">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!cachedData) return null;

    return (
        <ServiceDetailView
            teamId={teamId}
            event={cachedData.event}
            setlist={cachedData.setlist}
            praiseAssignee={cachedData.praiseAssignee}
            flow={cachedData.flow}
            roles={roles}
            members={members}
            currentUserUid={currentUserUid}
            onDataChanged={refetchData}
            myRoles={myRoles}
        />
    );
}
