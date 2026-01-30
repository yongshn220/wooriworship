"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRecoilState } from "recoil";
import { ServiceEvent, ServiceRole, ServiceAssignment, ServiceFlowItem } from "@/models/services/ServiceEvent";
import { MyAssignment, MyAssignmentRole } from "@/models/services/MyAssignment";
import { PraiseTeamApi } from "@/apis/PraiseTeamApi";
import { ServiceFlowApi } from "@/apis/ServiceFlowApi";
import { myAssignmentsCacheAtom } from "@/global-states/serviceEventState";

interface UseMyAssignmentsParams {
    teamId: string;
    events: ServiceEvent[];
    currentUserUid: string;
    roles: ServiceRole[];
    serviceTags: any[]; // matches fetchServiceTagsSelector return type
    cacheVersion: number;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

export function useMyAssignments({
    teamId,
    events,
    currentUserUid,
    roles,
    serviceTags,
    cacheVersion,
}: UseMyAssignmentsParams) {
    const fetchedIdsRef = useRef<Set<string>>(new Set());
    const [cache, setCache] = useRecoilState(myAssignmentsCacheAtom);
    const [isLoading, setIsLoading] = useState(false);
    const prevCacheVersionRef = useRef(cacheVersion);

    useEffect(() => {
        if (!teamId || !currentUserUid) return;

        // Cache invalidation: if cacheVersion changed, clear everything
        if (prevCacheVersionRef.current !== cacheVersion) {
            prevCacheVersionRef.current = cacheVersion;
            fetchedIdsRef.current = new Set();
            setCache({});
        }

        // Incremental: only fetch services NOT already cached
        const newEvents = events.filter(e => !fetchedIdsRef.current.has(e.id));
        if (newEvents.length === 0) return;

        let cancelled = false;
        setIsLoading(true);

        const chunks = chunkArray(newEvents, 10);

        (async () => {
            const newCacheEntries: Record<string, {
                praiseTeamAssignments: ServiceAssignment[];
                flowItems: ServiceFlowItem[];
            }> = {};

            for (const chunk of chunks) {
                if (cancelled) break;

                const results = await Promise.all(
                    chunk.map(async (event) => {
                        const [praiseTeam, flow] = await Promise.all([
                            PraiseTeamApi.getPraiseTeam(teamId, event.id),
                            ServiceFlowApi.getFlow(teamId, event.id),
                        ]);
                        return {
                            serviceId: event.id,
                            praiseTeamAssignments: praiseTeam?.assignments ?? [],
                            flowItems: flow?.items ?? [],
                        };
                    })
                );

                for (const r of results) {
                    newCacheEntries[r.serviceId] = {
                        praiseTeamAssignments: r.praiseTeamAssignments,
                        flowItems: r.flowItems,
                    };
                    fetchedIdsRef.current.add(r.serviceId);
                }
            }

            if (!cancelled) {
                setCache(prev => ({ ...prev, ...newCacheEntries }));
                setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [events, cacheVersion, teamId, currentUserUid, setCache]);

    // Derive assignments from cache
    const { myAssignments, assignedServiceIds } = useMemo(() => {
        const assigned: string[] = [];
        const assignments: MyAssignment[] = [];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (const event of events) {
            const cached = cache[event.id];
            if (!cached) continue;

            const myRoles: MyAssignmentRole[] = [];

            // Check praise team assignments
            for (const assignment of cached.praiseTeamAssignments) {
                if (assignment.memberIds.includes(currentUserUid)) {
                    const roleName = (assignment.roleId
                        ? roles.find(r => r.id === assignment.roleId)?.name
                        : null)
                        ?? assignment.label
                        ?? "Member";
                    myRoles.push({ source: 'praise_team', roleName });
                }
            }

            // Check flow item assignments
            for (const item of cached.flowItems) {
                for (const assignment of item.assignments) {
                    if (assignment.memberIds.includes(currentUserUid)) {
                        const roleName = (assignment.roleId
                            ? roles.find(r => r.id === assignment.roleId)?.name
                            : null)
                            ?? assignment.label
                            ?? "Member";
                        myRoles.push({
                            source: 'flow',
                            roleName,
                            flowItemTitle: item.title,
                        });
                    }
                }
            }

            if (myRoles.length > 0) {
                assigned.push(event.id);
                const eventDate = event.date.toDate();
                if (eventDate >= now) {
                    let badgeLabel = "Event";
                    if (event.tagId) {
                        const tagName = serviceTags?.find((t: any) => t.id === event.tagId)?.name;
                        badgeLabel = tagName || event.title;
                    } else if (event.title) {
                        badgeLabel = event.title;
                    }

                    assignments.push({
                        serviceId: event.id,
                        serviceDate: eventDate,
                        serviceTitle: event.title,
                        serviceBadgeLabel: badgeLabel,
                        roles: myRoles,
                    });
                }
            }
        }

        assignments.sort((a, b) => a.serviceDate.getTime() - b.serviceDate.getTime());

        return { myAssignments: assignments, assignedServiceIds: assigned };
    }, [cache, events, currentUserUid, roles, serviceTags]);

    return { myAssignments, assignedServiceIds, isLoading };
}
