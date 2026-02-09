"use client";



import { useEffect, useState, useMemo, Suspense } from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { currentTeamIdAtom, teamAtom, fetchServiceTagsSelector } from "@/global-states/teamState";
import { fetchServingRolesSelector } from "@/global-states/serviceRolesState";
import { serviceEventsListAtom, myAssignmentCountAtom } from "@/global-states/serviceEventState";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";
import { ServiceEvent } from "@/models/services/ServiceEvent";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { ServiceListSkeleton } from "./_components/service-list-skeleton";
import { parseLocalDate, timestampToDateString } from "@/components/util/helper/helper-functions";
import { Timestamp } from "firebase/firestore";
import { EmptyServiceBoardPage } from "./_components/empty-service-board-page";
import { CalendarStrip } from "@/components/common/board-calendar/calendar-strip";
import { CalendarItem } from "@/components/common/board-calendar/types";
import { useCalendarNavigation } from "@/components/common/hooks/use-calendar-navigation";
import { ServiceDetailContainer } from "@/components/elements/design/service/service-detail-container";

import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { serviceFilterModeAtom } from "@/global-states/serviceEventState";

import { SwipeableView } from "@/components/elements/design/service/swipeable-view";
import { ServiceDataPrefetcher } from "./_components/service-data-prefetcher";
import { useMyAssignments } from "@/hooks/use-my-assignments";
import { MyAssignmentRole } from "@/models/services/MyAssignment";
import { InlineCalendarView } from "./_components/inline-calendar-view";
import { ContentContainer } from "@/components/common/layout/content-container";

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const [events, setEvents] = useRecoilState(serviceEventsListAtom);
    const [loading, setLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [isLoadingPast, setIsLoadingPast] = useState(false);
    const [hasMorePast, setHasMorePast] = useState(true);
    const router = useRouter();
    const setCurrentPage = useSetRecoilState(currentPageAtom);
    const setMyAssignmentCount = useSetRecoilState(myAssignmentCountAtom);

    // My Assignments state
    const [filterMode, setFilterMode] = useRecoilState(serviceFilterModeAtom);
    const [cacheVersion, setCacheVersion] = useState(0);

    // Set Page ID for Navbar Title and Config
    useEffect(() => {
        setCurrentPage(Page.SERVING);
    }, [setCurrentPage]);

    const roles = useRecoilValue(fetchServingRolesSelector(teamId || ""));
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId || ""));

    // Map events to CalendarItem
    const calendarItems: CalendarItem[] = useMemo(() => {
        return events.map(e => {
            const date = e.date.toDate();
            let badgeLabel = "Event";
            if (e.tagId) {
                // Resolve tag name
                const tagName = serviceTags?.find((t: any) => t.id === e.tagId)?.name;
                badgeLabel = tagName || e.title;
            } else if (e.title) {
                badgeLabel = e.title;
            }

            return {
                id: e.id,
                date: date,
                title: e.title,
                badgeLabel: badgeLabel,
                description: `View Details`,
                originalData: e
            };
        });
    }, [events, serviceTags]);

    // Navigation Hook
    const { navigateNext, navigatePrev } = useCalendarNavigation(
        calendarItems,
        selectedScheduleId,
        setSelectedScheduleId
    );

    // Data for selected schedule
    const selectedSchedule = useMemo(() =>
        events.find(s => s.id === selectedScheduleId),
        [events, selectedScheduleId]);

    const currentUserUid = auth.currentUser?.uid;

    const { myAssignments, assignedServiceIds, isLoading: isAssignmentsLoading } = useMyAssignments({
        teamId: teamId || "",
        events,
        currentUserUid: currentUserUid || "",
        roles,
        serviceTags,
        cacheVersion,
    });

    // Sync upcoming assignment count to Recoil for the header badge
    const upcomingAssignmentCount = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return myAssignments.filter(a => a.serviceDate >= now).length;
    }, [myAssignments]);

    useEffect(() => {
        setMyAssignmentCount(upcomingAssignmentCount);
    }, [upcomingAssignmentCount, setMyAssignmentCount]);

    const handleModeChange = (newMode: 'all' | 'mine' | 'calendar') => {
        setFilterMode(newMode);
    };

    const filteredCalendarItems = useMemo(() => {
        if (filterMode === 'mine') {
            return calendarItems.filter(item => assignedServiceIds.includes(item.id));
        }
        return calendarItems;
    }, [calendarItems, filterMode, assignedServiceIds]);

    // Current user's roles for the selected service (Mine + Calendar mode)
    const myRolesForSelected = useMemo(() => {
        if (!selectedScheduleId) return undefined;
        const assignment = myAssignments.find(a => a.serviceId === selectedScheduleId);
        return assignment?.roles;
    }, [selectedScheduleId, myAssignments]);

    // Load schedules (Initial: Upcoming only)
    useEffect(() => {
        async function loadData() {
            if (!teamId) return;
            try {
                // 1. Define Range: Past 3 months + Future 6 months
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const initialStart = new Date(todayStart);
                initialStart.setMonth(initialStart.getMonth() - 3);

                const futureEnd = new Date(todayStart);
                futureEnd.setMonth(futureEnd.getMonth() + 6);

                // Probe boundary must be strictly before initialStart to avoid overlap
                const probEnd = new Date(initialStart.getTime() - 1);
                const [data, olderProbe] = await Promise.all([
                    ServiceEventApi.getServiceEvents(teamId, initialStart, futureEnd),
                    ServiceEventApi.getServiceEvents(teamId, new Date(2000, 0, 1), probEnd, 1),
                ]);

                setEvents(data);
                setHasMorePast(olderProbe.length > 0);

                // Select logic:
                // 1. First upcoming event (>= today)
                // 2. If no upcoming, select the latest past event (last element if sorted ASC)
                // 3. Current `getServiceEvents` returns ASC sorted.

                if (!selectedScheduleId && data.length > 0) {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    // Find first event strictly >= today (Upcoming)
                    const firstUpcoming = data.find(e => e.date.toDate() >= now);

                    if (firstUpcoming) {
                        setSelectedScheduleId(firstUpcoming.id);
                    } else {
                        // All are past events. Pick the last one (Most recent past).
                        const lastPast = data[data.length - 1];
                        setSelectedScheduleId(lastPast.id);
                    }
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [teamId, setEvents]);

    const handleLoadPrev = async () => {
        if (!teamId || isLoadingPast || !hasMorePast) return;
        setIsLoadingPast(true);
        try {
            // Load previous 6 months
            const currentEvents = events;
            const firstEvent = currentEvents[0];

            let endDate = new Date();
            if (firstEvent) {
                endDate = firstEvent.date.toDate();
            }

            // Move back 6 months from END date
            const startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 6);

            const data = await ServiceEventApi.getServiceEvents(teamId, startDate, endDate);

            if (data.length === 0) {
                setHasMorePast(false);
            } else {
                // Merge: New(Old) + Existing
                // Ensure uniqueness
                const existingIds = new Set(events.map(e => e.id));
                const newData = data.filter(e => !existingIds.has(e.id));

                if (newData.length === 0) setHasMorePast(false);

                // Sort ASC (ServiceEventApi returns ASC)
                const merged = [...newData, ...events].sort((a, b) => a.date.seconds - b.date.seconds);
                setEvents(merged);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingPast(false);
        }
    };

    // Handle automatic re-selection if the currently selected schedule is deleted
    useEffect(() => {
        if (!selectedScheduleId || events.length === 0) return;

        const exists = events.some(s => s.id === selectedScheduleId);
        if (!exists) {
            // Same logic as initial load: first upcoming, or most recent past
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const firstUpcoming = events.find(e => e.date.toDate() >= now);
            if (firstUpcoming) {
                setSelectedScheduleId(firstUpcoming.id);
            } else {
                setSelectedScheduleId(events[events.length - 1].id);
            }
        }
    }, [events, selectedScheduleId]);

    // Auto-select first upcoming assigned service when switching to Mine
    useEffect(() => {
        if (filterMode === 'mine' && !isAssignmentsLoading && myAssignments.length > 0) {
            const currentIsInFiltered = assignedServiceIds.includes(selectedScheduleId || "");
            if (!currentIsInFiltered) {
                setSelectedScheduleId(myAssignments[0].serviceId);
            }
        }
    }, [filterMode, isAssignmentsLoading, myAssignments, assignedServiceIds, selectedScheduleId]);


    if (loading) {
        return <ServiceListSkeleton />;
    }

    if (events.length === 0) {
        return (
            <div className="flex flex-col h-full w-full bg-surface dark:bg-surface-dark relative">
                <div className="flex-1">
                    <EmptyServiceBoardPage />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-surface dark:bg-surface-dark relative font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-[env(safe-area-inset-bottom)]">
                <ContentContainer className="pt-2 space-y-5 pb-24">
                    {filterMode === 'calendar' ? (
                        <InlineCalendarView
                            items={calendarItems}
                            selectedId={selectedScheduleId}
                            onSelect={setSelectedScheduleId}
                            myAssignments={myAssignments}
                        />
                    ) : (
                        <CalendarStrip
                            items={filteredCalendarItems}
                            selectedId={selectedScheduleId}
                            onSelect={setSelectedScheduleId}
                            onLoadPrev={filterMode === 'all' ? handleLoadPrev : undefined}
                            isLoadingPrev={isLoadingPast}
                            hasMorePast={filterMode === 'all' && hasMorePast}
                            myAssignments={myAssignments}
                        />
                    )}

                    {/* Details Section */}
                    <div className="mt-6">
                        <Suspense fallback={<ServiceListSkeleton />}>
                            {selectedScheduleId ? (
                                <ServiceDetailContainer
                                    serviceId={selectedScheduleId}
                                    teamId={teamId}
                                    roles={roles}
                                    currentUserUid={currentUserUid}
                                    myRoles={myRolesForSelected}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-10 text-muted-foreground border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                                    <span className="text-sm">Select a service to view details</span>
                                </div>
                            )}
                        </Suspense>
                    </div>
                </ContentContainer>
            </div>
        </div>
    );
}
