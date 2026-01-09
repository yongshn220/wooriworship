"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { fetchServingRolesSelector, servingSchedulesAtom } from "@/global-states/servingState";
import { ServingService } from "@/apis";
import { ServingListSkeleton } from "./_components/serving-list-skeleton";
import { timestampToDateString } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { EmptyServingBoardPage } from "./_components/empty-serving-board-page";
import { WorshipPlanPreviewDrawer } from "@/components/elements/design/worship/worship-plan-preview-drawer";
import { CalendarStrip } from "@/components/elements/design/serving/calendar-strip";
import { ServingDetailView } from "@/components/elements/design/serving/serving-detail-view";
import { usersAtom } from "@/global-states/userState";
import { getPathCreateServing } from "@/components/util/helper/routes";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { headerActionsAtom } from "@/app/board/_states/board-states";
import { ServingHeaderMenu } from "@/components/elements/design/serving/serving-header-menu";

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const [schedules, setSchedules] = useRecoilState(servingSchedulesAtom);
    const [loading, setLoading] = useState(true);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [isLoadingPast, setIsLoadingPast] = useState(false);
    const [hasMorePast, setHasMorePast] = useState(true);
    const router = useRouter();
    const setHeaderActions = useSetRecoilState(headerActionsAtom);

    // Data for selected schedule
    const selectedSchedule = useMemo(() =>
        schedules.find(s => s.id === selectedScheduleId),
        [schedules, selectedScheduleId]);

    const roles = useRecoilValue(fetchServingRolesSelector(teamId || ""));

    // Fetch members only for the selected schedule
    const allMemberIds = useMemo(() => {
        if (!selectedSchedule) return [];
        return [
            ...(selectedSchedule.items?.flatMap(item => item.assignments.flatMap(a => a.memberIds)) || []),
            ...(selectedSchedule.worship_roles?.flatMap(a => a.memberIds) || []),
            ...(selectedSchedule.roles?.flatMap(r => r.memberIds) || [])
        ];
    }, [selectedSchedule]);

    const members = useRecoilValue(usersAtom(allMemberIds));
    const currentUserUid = auth.currentUser?.uid;

    // Load schedules (Initial: Upcoming only)
    useEffect(() => {
        async function loadData() {
            if (!teamId) return;
            try {
                // Fetch Future: Today to 6 months future
                const today = new Date();
                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 6);

                const startStr = format(today, "yyyy-MM-dd");
                const endStr = format(futureDate, "yyyy-MM-dd");

                const data = await ServingService.getSchedules(teamId, startStr, endStr);

                // Sort by date ASC
                data.sort((a, b) => {
                    const dateA = a.date instanceof Timestamp ? a.date.toDate().getTime() : new Date(a.date).getTime();
                    const dateB = b.date instanceof Timestamp ? b.date.toDate().getTime() : new Date(b.date).getTime();
                    return dateA - dateB;
                });
                setSchedules(data);

                // Select most recent upcoming (first item in sorted future list)
                if (data.length > 0) {
                    setSelectedScheduleId(data[0].id);
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
            const LIMIT = 5;
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
                        schedules={schedules}
                        selectedScheduleId={selectedScheduleId}
                        onSelect={setSelectedScheduleId}
                        onLoadPrev={handleLoadPast}
                        isLoadingPrev={isLoadingPast}
                        hasMorePast={hasMorePast}
                    />

                    {selectedSchedule ? (
                        <ServingDetailView
                            schedule={selectedSchedule}
                            roles={roles}
                            members={members}
                            currentUserUid={currentUserUid}
                            teamId={teamId || ""}
                        />
                    ) : (
                        <div className="py-10 text-center text-muted-foreground">
                            Select a schedule to view details
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
