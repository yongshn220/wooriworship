"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const [schedules, setSchedules] = useRecoilState(servingSchedulesAtom);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

                const startStr = pastDate.toISOString().split("T")[0];
                const endStr = futureDate.toISOString().split("T")[0];

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
        const todayStr = new Date().toISOString().split("T")[0];
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
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-4 content-container-safe-area pb-24 space-y-8">

                {/* Upcoming Section */}
                <section className="space-y-4">


                    {upcoming.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-card/50 rounded-xl border border-dashed border-border text-muted-foreground">
                            <p>No upcoming schedules.</p>
                            <p className="text-sm">Create one to get started!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {upcoming.map(schedule => (
                                <ServingCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    teamId={teamId}
                                    currentUserUid={currentUserUid}
                                    defaultExpanded={false}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Historical Section */}
                {history.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-lg font-bold text-muted-foreground px-1 mt-8">
                            <History className="w-5 h-5" />
                            <h2>Past Schedules</h2>
                        </div>
                        <div className="grid gap-4 opacity-80">
                            {history.map(schedule => (
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
                )}
            </div>

            {/* Floating Action Button - Removed as moved to top nav */}
        </div>
    );
}
