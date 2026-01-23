"use client";



import { useEffect, useState, useMemo, Suspense } from "react";
import { format } from "date-fns";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { fetchServingRolesSelector, servingSchedulesAtom } from "@/global-states/servingState";
import { ServingService } from "@/apis";
import { ServingListSkeleton } from "./_components/serving-list-skeleton";
import { parseLocalDate, timestampToDateString } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { EmptyServingBoardPage } from "./_components/empty-serving-board-page";
import { WorshipPlanPreviewDrawer } from "@/components/elements/design/worship/worship-plan-preview-drawer";
// import { CalendarStrip } from "@/components/elements/design/serving/calendar-strip"; // REMOVED
import { CalendarStrip } from "@/components/common/board-calendar/calendar-strip"; // NEW
import { CalendarItem } from "@/components/common/board-calendar/types"; // NEW
import { useCalendarNavigation } from "@/components/common/hooks/use-calendar-navigation"; // NEW
import { ServingDetailContainer } from "@/components/elements/design/serving/serving-detail-container";

import { getPathCreateServing } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { headerActionsAtom } from "@/app/board/_states/board-states";
import { ServingHeaderMenu } from "@/components/elements/design/serving/serving-header-menu";

import { SwipeableView } from "@/components/elements/design/serving/swipeable-view";
// import { useServingNavigation } from "./_hooks/use-serving-navigation"; // REMOVED
import { ServingDataPrefetcher } from "./_components/serving-data-prefetcher";

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const [schedules, setSchedules] = useRecoilState(servingSchedulesAtom);
    const [loading, setLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [isLoadingPast, setIsLoadingPast] = useState(false);
    const [hasMorePast, setHasMorePast] = useState(true);
    const router = useRouter();
    const setHeaderActions = useSetRecoilState(headerActionsAtom);

    // Map schedules to CalendarItem
    const calendarItems: CalendarItem[] = useMemo(() => {
        return schedules.map(s => {
            const date = s.date instanceof Timestamp ? s.date.toDate() : parseLocalDate(s.date);
            let badgeLabel = "Event";
            if (s.service_tags && s.service_tags.length > 0) {
                // Resolve tag name
                const tagId = s.service_tags[0];
                const tagName = team?.service_tags?.find((t: any) => t.id === tagId)?.name;
                badgeLabel = tagName || "Worship";
            }
            // Logic moved from old CalendarStrip:
            if (s.title) {
                // If title is short enough, use it as badge? Original code did this.
                // Original: if (schedule.title) topLabel = schedule.title.length > 4 ? schedule.title.substring(0, 4) : schedule.title;
                // Let's stick to simple "Worship" or "Event" for badgeLabel mostly, unless title is short?
                // Actually the generic component truncates badgeLabel to 8 chars.
                if (s.title.length <= 4) badgeLabel = s.title;
            }

            return {
                id: s.id,
                date: date,
                title: s.title,
                badgeLabel: badgeLabel,
                description: `${s.worship_roles?.length || 0} worship roles`, // Example description
                originalData: s
            };
        });
    }, [schedules, team]);

    // Navigation Hook
    const { navigateNext, navigatePrev } = useCalendarNavigation(
        calendarItems,
        selectedScheduleId,
        setSelectedScheduleId
    );

    // Data for selected schedule
    const selectedSchedule = useMemo(() =>
        schedules.find(s => s.id === selectedScheduleId),
        [schedules, selectedScheduleId]);

    const roles = useRecoilValue(fetchServingRolesSelector(teamId || ""));


    const currentUserUid = auth.currentUser?.uid;

    // Load schedules (Initial: Upcoming only)
    useEffect(() => {
        async function loadData() {
            if (!teamId) return;
            try {
                // 1. Define Range: Future (Today to 6 months)
                const today = new Date();
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 6);

                const startStr = format(today, "yyyy-MM-dd");
                const endStr = format(futureDate, "yyyy-MM-dd");

                // 2. Fetch Future & Past (concurrently)
                const [futureData, pastData] = await Promise.all([
                    ServingService.getSchedules(teamId, startStr, endStr),
                    ServingService.getPreviousSchedules(teamId, todayStart, 30) // Initial history load
                ]);

                // 3. Merge & Sort
                const combined = [...pastData, ...futureData];
                // Deduplicate just in case
                const uniqueMap = new Map();
                combined.forEach(s => uniqueMap.set(s.id, s));
                const data = Array.from(uniqueMap.values()) as ServingSchedule[];

                // Sort by date ASC
                data.sort((a, b) => {
                    const dateA = a.date instanceof Timestamp ? a.date.toDate().getTime() : new Date(a.date).getTime();
                    const dateB = b.date instanceof Timestamp ? b.date.toDate().getTime() : new Date(b.date).getTime();
                    return dateA - dateB;
                });

                setSchedules(data);

                // 4. Initial Selection Logic
                // Priority 1: First Upcoming (>= Today)
                // Priority 2: Latest Past (Last item in list, if no upcoming)

                const firstUpcoming = data.find(s => {
                    const d = s.date instanceof Timestamp ? s.date.toDate() : parseLocalDate(s.date);
                    return d >= todayStart;
                });

                if (firstUpcoming) {
                    setSelectedScheduleId(firstUpcoming.id);
                } else if (data.length > 0) {
                    // No upcoming, but we have history. Select the last one (latest history).
                    setSelectedScheduleId(data[data.length - 1].id);
                } else {
                    setSelectedScheduleId(null);
                }

            } catch (e) {
                console.error("Failed to load serving schedules", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [teamId, setSchedules]);

    const handleLoadPast = async () => {
        if (!teamId || schedules.length === 0 || isLoadingPast || !hasMorePast) return;
        setIsLoadingPast(true);
        try {
            const firstSchedule = schedules[0];
            const firstDate = firstSchedule.date instanceof Timestamp ? firstSchedule.date.toDate() : new Date(firstSchedule.date);

            // Limit 5
            const LIMIT = 30;
            const pastData = await ServingService.getPreviousSchedules(teamId, firstDate, LIMIT);

            if (pastData.length < LIMIT) {
                setHasMorePast(false);
            }

            if (pastData.length > 0) {
                // Sort past data ASC to merge correctly (though getPrevious returns DESC usually)
                pastData.sort((a, b) => {
                    const dateA = a.date instanceof Timestamp ? a.date.toDate().getTime() : new Date(a.date).getTime();
                    const dateB = b.date instanceof Timestamp ? b.date.toDate().getTime() : new Date(b.date).getTime();
                    return dateA - dateB;
                });

                setSchedules(prev => [...pastData, ...prev]);
            }
        } catch (e) {
            console.error("Failed to load past schedules", e);
        } finally {
            setIsLoadingPast(false);
        }
    };

    // Handle automatic re-selection if the currently selected schedule is deleted
    useEffect(() => {
        if (!selectedScheduleId || schedules.length === 0) return;

        const exists = schedules.some(s => s.id === selectedScheduleId);
        if (!exists) {
            // Selected item was deleted. Select the first available one as a fallback.
            setSelectedScheduleId(schedules[0].id);
        }
    }, [schedules, selectedScheduleId]);





    if (loading) {
        return <ServingListSkeleton />;
    }

    if (schedules.length === 0) {
        return (
            <div className="flex flex-col h-full w-full bg-surface dark:bg-surface-dark relative">
                <div className="flex-1">
                    <EmptyServingBoardPage />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-surface dark:bg-surface-dark relative font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
            <div className="flex-1 overflow-y-auto pb-safe">
                <main className="max-w-lg mx-auto px-4 pt-2 space-y-5 pb-24">
                    <CalendarStrip
                        items={calendarItems}
                        selectedId={selectedScheduleId}
                        onSelect={setSelectedScheduleId}
                        onLoadPrev={handleLoadPast}
                        isLoadingPrev={isLoadingPast}
                        hasMorePast={hasMorePast}
                    />

                    {selectedSchedule ? (
                        <SwipeableView
                            viewId={selectedSchedule.id}
                            onSwipeLeft={navigateNext}
                            onSwipeRight={navigatePrev}
                        >
                            <Suspense fallback={<ServingListSkeleton />}>
                                <ServingDetailContainer
                                    schedule={selectedSchedule}
                                    roles={roles}
                                    currentUserUid={currentUserUid}
                                    teamId={teamId || ""}
                                />
                            </Suspense>
                        </SwipeableView>
                    ) : (
                        <div className="py-10 text-center text-muted-foreground">
                            Select a schedule to view details
                        </div>
                    )}

                    {/* Zero-Latency Prefetching */}
                    {schedules.map((schedule, index) => {
                        // Prefetch conditions:
                        // 1. Next item relative to current selection
                        // 2. Previous item relative to current selection
                        // Simple approach: Prefetch neighbours of the selected ID
                        const currentIndex = schedules.findIndex(s => s.id === selectedScheduleId);
                        if (index === currentIndex + 1 || index === currentIndex - 1) {
                            return (
                                <Suspense key={`prefetch-${schedule.id}`} fallback={null}>
                                    <ServingDataPrefetcher schedule={schedule} />
                                </Suspense>
                            );
                        }
                        return null;
                    })}
                </main>
            </div>
        </div>
    );
}
