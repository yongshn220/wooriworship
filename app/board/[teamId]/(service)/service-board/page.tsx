"use client";



import { useEffect, useState, useMemo, Suspense } from "react";
import { format } from "date-fns";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { currentTeamIdAtom, teamAtom, fetchServiceTagsSelector } from "@/global-states/teamState";
import { fetchServingRolesSelector } from "@/global-states/serviceRolesState";
import { serviceEventsListAtom } from "@/global-states/serviceEventState";
import { currentPageAtom } from "@/global-states/page-state";
import { Page } from "@/components/constants/enums";
import { ServiceEvent } from "@/models/services/ServiceEvent";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { ServiceListSkeleton } from "./_components/service-list-skeleton";
import { parseLocalDate, timestampToDateString } from "@/components/util/helper/helper-functions";
import { Timestamp } from "firebase/firestore";
import { EmptyServiceBoardPage } from "./_components/empty-service-board-page";
// import { CalendarStrip } from "@/components/elements/design/serving/calendar-strip"; // REMOVED
import { CalendarStrip } from "@/components/common/board-calendar/calendar-strip"; // NEW
import { CalendarItem } from "@/components/common/board-calendar/types"; // NEW
import { useCalendarNavigation } from "@/components/common/hooks/use-calendar-navigation"; // NEW
import { ServiceDetailContainer } from "@/components/elements/design/service/service-detail-container";

import { getPathCreateServing } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { headerActionsAtom, headerLeftContentAtom } from "@/app/board/_states/board-states";
import { serviceFilterModeAtom } from "@/global-states/serviceEventState";
import { ServiceHeaderMenu } from "@/components/elements/design/service/service-header-menu";
import { ServiceCreationMenu } from "@/components/elements/design/service/service-creation-menu";

import { SwipeableView } from "@/components/elements/design/service/swipeable-view";
// import { useServingNavigation } from "./_hooks/use-serving-navigation"; // REMOVED
import { ServiceDataPrefetcher } from "./_components/service-data-prefetcher";
import { useMyAssignments } from "@/hooks/use-my-assignments";
import { ServiceBoardHeaderLeft, ServiceBoardHeaderRight } from "./_components/service-board-header";
import { MyAssignmentsSummary } from "./_components/my-assignments-summary";
import { GenericCalendarDrawer } from "@/components/common/board-calendar/generic-calendar-drawer";

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const [events, setEvents] = useRecoilState(serviceEventsListAtom);
    const [loading, setLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [isLoadingPast, setIsLoadingPast] = useState(false);
    const [hasMorePast, setHasMorePast] = useState(true);
    const router = useRouter();
    const setHeaderActions = useSetRecoilState(headerActionsAtom);
    const setHeaderLeftContent = useSetRecoilState(headerLeftContentAtom);
    const setCurrentPage = useSetRecoilState(currentPageAtom);

    // My Assignments state
    const [filterMode, setFilterMode] = useRecoilState(serviceFilterModeAtom);
    const [cacheVersion, setCacheVersion] = useState(0);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    }, [events, team]);

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

    const handleModeChange = (newMode: 'all' | 'mine') => {
        if (newMode === 'mine') {
            setCacheVersion(prev => prev + 1);
        }
        setFilterMode(newMode);
    };

    const getMonthLabel = () => {
        if (selectedScheduleId) {
            const selected = events.find(s => s.id === selectedScheduleId);
            if (selected) {
                return format(selected.date.toDate(), "MMMM yyyy");
            }
        }
        return format(new Date(), "MMMM yyyy");
    };

    const filteredCalendarItems = useMemo(() => {
        if (filterMode === 'mine') {
            return calendarItems.filter(item => assignedServiceIds.includes(item.id));
        }
        return calendarItems;
    }, [calendarItems, filterMode, assignedServiceIds]);

    // Load schedules (Initial: Upcoming only)
    useEffect(() => {
        async function loadData() {
            if (!teamId) return;
            try {
                // 1. Define Range: Recent Past + Future (Past 1 month to 6 months future)
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const initialStart = new Date(todayStart);
                initialStart.setMonth(initialStart.getMonth() - 3);

                const futureEnd = new Date(todayStart);
                futureEnd.setMonth(futureEnd.getMonth() + 6);

                const data = await ServiceEventApi.getServiceEvents(teamId, initialStart, futureEnd);

                // Sort by date (ServiceEventApi orders ASC, we want ASC for future? 
                // Wait, CalendarStrip usually likes sorted data. ServiceEventApi does ASC.
                // But `setEvents(data)` replaces existing.

                setEvents(data);

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
    }, [teamId, setEvents]); // Removed setHeaderActions from dependencies since we use it in separate effect

    // Set Header Content (Left: Toggle + Month, Right: Calendar + Create)
    useEffect(() => {
        setHeaderLeftContent(
            <ServiceBoardHeaderLeft
                filterMode={filterMode}
                onFilterModeChange={handleModeChange}
                myCount={assignedServiceIds.length}
                monthLabel={getMonthLabel()}
            />
        );
        setHeaderActions(
            <div className="flex items-center gap-1">
                <ServiceBoardHeaderRight onCalendarOpen={() => setIsCalendarOpen(true)} />
                <ServiceCreationMenu
                    teamId={teamId || ""}
                    selectedServiceId={selectedScheduleId}
                />
            </div>
        );
        return () => {
            setHeaderLeftContent(null);
            setHeaderActions(null);
        };
    }, [teamId, selectedScheduleId, filterMode, assignedServiceIds.length, setHeaderActions, setHeaderLeftContent]);



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
                // Subtract 1ms to avoid overlap? Or query strictly less than.
                // ServiceEventApi has specific query methods list? 
                // It has `getServiceEvents`. I can re-use it.
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
            // Selected item was deleted. Select the first available one as a fallback.
            setSelectedScheduleId(events[0].id);
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
            <div className="flex-1 overflow-y-auto pb-safe">
                <main className="max-w-lg mx-auto px-4 pt-2 space-y-5 pb-24">
                    <CalendarStrip
                        items={filteredCalendarItems}
                        selectedId={selectedScheduleId}
                        onSelect={setSelectedScheduleId}
                        onLoadPrev={handleLoadPrev}
                        isLoadingPrev={isLoadingPast}
                        hasMorePast={hasMorePast}
                        assignedServiceIds={assignedServiceIds}
                    />

                    {/* Assignment Summary (Mine mode only) */}
                    {filterMode === 'mine' && (
                        isAssignmentsLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                                <div className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                                <div className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                                <div className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                            </div>
                        ) : (
                            <MyAssignmentsSummary
                                assignments={myAssignments}
                                selectedServiceId={selectedScheduleId}
                                onSelectService={setSelectedScheduleId}
                            />
                        )
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
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-10 text-muted-foreground border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                                    <span className="text-sm">Select a service to view details</span>
                                </div>
                            )}
                        </Suspense>
                    </div>
                </main>
            </div>

            <GenericCalendarDrawer
                open={isCalendarOpen}
                onOpenChange={setIsCalendarOpen}
                items={filteredCalendarItems}
                selectedId={selectedScheduleId}
                onSelect={setSelectedScheduleId}
                assignedIds={filterMode === 'mine' ? assignedServiceIds : undefined}
            />
        </div>
    );
}
