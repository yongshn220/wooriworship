"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { servingSchedulesAtom } from "@/global-states/servingState";
import { ServingService } from "@/apis";
import { Button } from "@/components/ui/button";
import { Plus, History, Calendar } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { getPathCreateServing } from "@/components/util/helper/routes";
import { ServingCard } from "./_components/serving-card";
import { auth } from "@/firebase";
import { ServingListSkeleton } from "./_components/serving-list-skeleton";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyServingBoardPage } from "./_components/empty-serving-board-page";

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const [schedules, setSchedules] = useRecoilState(servingSchedulesAtom);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

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

                // Sort by date descending as requested
                data.sort((a, b) => b.date.localeCompare(a.date));
                setSchedules(data);
            } catch (e) {
                console.error("Failed to load serving schedules", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [teamId, setSchedules]);

    // Split Data
    const { upcoming, history } = useMemo(() => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const upcomingList: typeof schedules = [];
        const historyList: typeof schedules = [];

        schedules.forEach(s => {
            if (s.date >= todayStr) {
                upcomingList.push(s);
            } else {
                historyList.push(s);
            }
        });

        // History should probably be distinct descending (newest past first)
        historyList.sort((a, b) => b.date.localeCompare(a.date));

        return { upcoming: upcomingList, history: historyList };
    }, [schedules]);

    const currentUserUid = auth.currentUser?.uid;

    if (loading) {
        return <ServingListSkeleton />;
    }

    const currentList = activeTab === "upcoming" ? upcoming : history;
    const isEmpty = currentList.length === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col h-full w-full bg-background relative">
                <div className="px-4 py-4 w-full z-10">
                    <SegmentedControl
                        value={activeTab}
                        onChange={(val) => setActiveTab(val)}
                        options={[
                            { label: "Upcoming", value: "upcoming" },
                            { label: "History", value: "history" },
                        ]}
                    />
                </div>
                <EmptyServingBoardPage />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-4 content-container-safe-area pb-24 space-y-6 overscroll-y-none">

                <div className="mb-4">
                    <SegmentedControl
                        value={activeTab}
                        onChange={(val) => setActiveTab(val)}
                        options={[
                            { label: "Upcoming", value: "upcoming" },
                            { label: "History", value: "history" },
                        ]}
                    />
                </div>

                {/* List Section */}
                <section className="space-y-4">
                    <div className="grid gap-4">
                        {currentList.map(schedule => (
                            <ServingCard
                                key={schedule.id}
                                schedule={schedule}
                                teamId={teamId}
                                currentUserUid={currentUserUid}
                                defaultExpanded={false}
                            />
                        ))}
                    </div>
                </section>
            </div>
            {/* Floating Action Button - Removed as moved to top nav */}
        </div>
    );
}
