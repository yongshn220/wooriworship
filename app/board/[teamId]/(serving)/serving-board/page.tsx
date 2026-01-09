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

    // Load schedules
    useEffect(() => {
        async function loadData() {
            if (!teamId) return;
            try {
                // Fetch a wide range: 3 months past to 6 months future
                const pastDate = new Date();
                pastDate.setMonth(pastDate.getMonth() - 3);

                const futureDate = new Date();
                futureDate.setMonth(futureDate.getMonth() + 6);

                const startStr = format(pastDate, "yyyy-MM-dd");
                const endStr = format(futureDate, "yyyy-MM-dd");

                const data = await ServingService.getSchedules(teamId, startStr, endStr);

                // Sort by date ASC (for calendar strip flow)
                data.sort((a, b) => {
                    const dateA = a.date instanceof Timestamp ? a.date.toDate().getTime() : new Date(a.date).getTime();
                    const dateB = b.date instanceof Timestamp ? b.date.toDate().getTime() : new Date(b.date).getTime();
                    return dateA - dateB;
                });
                setSchedules(data);

                // Set default selection to nearest upcoming (or last if all past, first if all future)
                if (data.length > 0) {
                    const todayStr = format(new Date(), "yyyy-MM-dd");
                    const upcoming = data.find(s => {
                        const sDate = s.date instanceof Timestamp ? timestampToDateString(s.date) : s.date;
                        return sDate >= todayStr;
                    });
                    // specific request: "Nearest upcoming". If none, maybe the last one (most recent past).
                    if (upcoming) {
                        setSelectedScheduleId(upcoming.id);
                    } else {
                        setSelectedScheduleId(data[data.length - 1].id);
                    }
                }
            } catch (e) {
                console.error("Failed to load serving schedules", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [teamId, setSchedules]);

    // Update Global Header Actions
    useEffect(() => {
        if (selectedScheduleId && teamId) {
            setHeaderActions(
                <ServingHeaderMenu scheduleId={selectedScheduleId} teamId={teamId} />
            );
        } else {
            setHeaderActions(null);
        }

        return () => setHeaderActions(null);
    }, [selectedScheduleId, teamId, setHeaderActions]);


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
                    />

                    {selectedSchedule ? (
                        <ServingDetailView
                            schedule={selectedSchedule}
                            roles={roles}
                            members={members}
                            currentUserUid={currentUserUid}
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
