"use client";

import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentTeamIdAtom } from "@/global-states/teamState";
import { servingSchedulesAtom } from "@/global-states/servingState";
import { ServingService } from "@/apis";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

export default function ServingPage() {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const [schedules, setSchedules] = useRecoilState(servingSchedulesAtom);
    const [loading, setLoading] = useState(true);

    // Load schedules (e.g., next 3 months)
    useEffect(() => {
        async function loadData() {
            if (!teamId) return;
            try {
                const today = new Date().toISOString().split("T")[0];
                const next3Months = new Date();
                next3Months.setMonth(next3Months.getMonth() + 3);
                const endDate = next3Months.toISOString().split("T")[0];

                const data = await ServingService.getSchedules(teamId, today, endDate);
                // Sort by date ascending
                data.sort((a, b) => a.date.localeCompare(b.date));
                setSchedules(data);
            } catch (e) {
                console.error("Failed to load serving schedules", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [teamId, setSchedules]);

    return (
        <div className="flex flex-col h-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <h1 className="text-2xl font-bold mb-6 text-foreground">Serving Schedule</h1>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Spinner />
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <p>No upcoming schedules.</p>
                        <p className="text-sm">Tap + to create one.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center border-b border-border pb-2 mb-1">
                                    <span className="font-semibold text-lg">
                                        {format(new Date(schedule.date), "MMM d, yyyy (EEE)")}
                                    </span>
                                </div>
                                {/* Summary View - showing a few key roles */}
                                <div className="text-sm text-muted-foreground">
                                    {schedule.roles.length} roles assigned
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-6 right-6">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
                    onClick={() => {
                        // TODO: Open Magic Wizard
                        alert("Open Wizard");
                    }}
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
