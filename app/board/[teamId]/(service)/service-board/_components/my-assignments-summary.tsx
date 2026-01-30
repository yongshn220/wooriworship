"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronRight, CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MyAssignment } from "@/models/services/MyAssignment";

interface MyAssignmentsSummaryProps {
    assignments: MyAssignment[];
    selectedServiceId: string | null;
    onSelectService: (serviceId: string) => void;
    maxVisible?: number;
}

export function MyAssignmentsSummary({
    assignments,
    selectedServiceId,
    onSelectService,
    maxVisible = 8,
}: MyAssignmentsSummaryProps) {
    const [showAll, setShowAll] = useState(false);

    if (assignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <CalendarOff className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No upcoming assignments</p>
                <p className="text-xs mt-1 opacity-60">Check back after the team leader assigns you</p>
            </div>
        );
    }

    const visibleAssignments = showAll ? assignments : assignments.slice(0, maxVisible);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Upcoming Assignments
                </h3>
                <span className="text-xs font-semibold text-primary">
                    {assignments.length}
                </span>
            </div>

            <div className="space-y-2">
                {visibleAssignments.map((assignment) => {
                    const isSelected = assignment.serviceId === selectedServiceId;
                    return (
                        <button
                            key={assignment.serviceId}
                            onClick={() => onSelectService(assignment.serviceId)}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                isSelected
                                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-primary/30 border-l-[3px] border-l-primary"
                                    : "bg-card border-border hover:border-primary/20 active:scale-[0.98]"
                            )}
                        >
                            {/* Date block */}
                            <div className="flex flex-col items-center justify-center shrink-0 w-11">
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">
                                    {format(assignment.serviceDate, "MMM")}
                                </span>
                                <span className="text-lg font-bold text-foreground -my-0.5">
                                    {format(assignment.serviceDate, "d")}
                                </span>
                                <span className="text-[9px] font-medium text-muted-foreground">
                                    {format(assignment.serviceDate, "EEE")}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                    {assignment.serviceBadgeLabel}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {assignment.roles.map((role, idx) => (
                                        <span
                                            key={idx}
                                            className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                role.source === 'praise_team'
                                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                                    : "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                                            )}
                                        >
                                            {role.roleName}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Chevron */}
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        </button>
                    );
                })}
            </div>

            {assignments.length > maxVisible && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center py-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    {showAll ? "Show less" : `View all ${assignments.length} assignments`}
                </button>
            )}
        </div>
    );
}
