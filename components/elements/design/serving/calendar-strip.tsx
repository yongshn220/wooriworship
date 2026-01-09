"use client";

import { cn } from "@/lib/utils";
import { ServingSchedule } from "@/models/serving";
import { Timestamp } from "@firebase/firestore";
import { format } from "date-fns";
import { Calendar, Loader2, History } from "lucide-react";
import { parseLocalDate } from "@/components/util/helper/helper-functions";
import { useEffect, useRef } from "react";

interface Props {
    schedules: ServingSchedule[];
    selectedScheduleId: string | null;
    onSelect: (scheduleId: string) => void;
    onLoadPrev?: () => void;
    isLoadingPrev?: boolean;
    hasMorePast?: boolean;
}

export function CalendarStrip({ schedules, selectedScheduleId, onSelect, onLoadPrev, isLoadingPrev, hasMorePast = true }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    // Effect to scroll selected item to start
    useEffect(() => {
        if (selectedScheduleId && itemRefs.current.has(selectedScheduleId)) {
            const el = itemRefs.current.get(selectedScheduleId);
            if (el) {
                el.scrollIntoView({ inline: 'start', behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedScheduleId]);


    // Determine the "current" month to display in the header
    const getMonthLabel = () => {
        if (selectedScheduleId) {
            const selected = schedules.find(s => s.id === selectedScheduleId);
            if (selected) {
                const date = selected.date instanceof Timestamp ? selected.date.toDate() : parseLocalDate(selected.date);
                return format(date, "MMMM yyyy");
            }
        }
        return format(new Date(), "MMMM yyyy");
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {getMonthLabel()}
                </span>
                <button className="text-primary text-[11px] font-bold uppercase hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors tracking-wide flex items-center gap-1">
                    CALENDAR
                    <Calendar className="w-3.5 h-3.5" />
                </button>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 pt-3 snap-x snap-mandatory items-center scroll-smooth no-scrollbar"
            >
                {/* Load Past Button */}
                {onLoadPrev && (
                    <button
                        onClick={hasMorePast ? onLoadPrev : undefined}
                        disabled={isLoadingPrev || !hasMorePast}
                        className={cn(
                            "snap-center shrink-0 w-[4.5rem] h-[5.5rem] rounded-xl flex flex-col items-center justify-center transition-all group relative border",
                            hasMorePast
                                ? "bg-panel dark:bg-panel-dark border-border-light dark:border-border-dark hover:border-blue-300 dark:hover:border-blue-700 active:scale-95 opacity-90 cursor-pointer"
                                : "bg-slate-50 dark:bg-white/5 border-transparent opacity-50 cursor-default"
                        )}
                    >
                        {isLoadingPrev ? (
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        ) : (
                            <div className="flex flex-col items-center gap-1">
                                <History className={cn("w-5 h-5", hasMorePast ? "text-slate-400" : "text-slate-300 dark:text-slate-600")} />
                                <span className={cn("text-[10px] font-medium leading-tight text-center", hasMorePast ? "text-slate-500" : "text-slate-400 dark:text-slate-600")}>
                                    {hasMorePast ? "Load\nHistory" : "No\nHistory"}
                                </span>
                            </div>
                        )}
                    </button>
                )}

                {schedules.map((schedule) => {
                    const date = schedule.date instanceof Timestamp ? schedule.date.toDate() : parseLocalDate(schedule.date);
                    const isSelected = schedule.id === selectedScheduleId;
                    const day = format(date, "d");
                    const month = format(date, "MMM");
                    const weekDay = format(date, "EEE");

                    let topLabel = "Event";
                    if (schedule.service_tags && schedule.service_tags.length > 0) {
                        topLabel = "Worship";
                    }
                    if (schedule.title) {
                        topLabel = schedule.title.length > 4 ? schedule.title.substring(0, 4) : schedule.title;
                    }

                    return (
                        <button
                            key={schedule.id}
                            ref={(el) => {
                                if (el) itemRefs.current.set(schedule.id, el);
                                else itemRefs.current.delete(schedule.id);
                            }}
                            onClick={() => onSelect(schedule.id)}
                            className={cn(
                                "snap-center shrink-0 w-[4.5rem] h-[5.5rem] rounded-xl flex flex-col items-center justify-center transition-all group active:scale-95 relative",
                                isSelected
                                    ? "bg-white dark:bg-panel-dark border-[2.5px] border-primary shadow-lg shadow-blue-500/10 dark:shadow-none z-10"
                                    : "bg-panel dark:bg-panel-dark border border-border-light dark:border-border-dark hover:border-blue-300 dark:hover:border-blue-700 opacity-90"
                            )}
                        >
                            {/* Pill Label */}
                            <div className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full absolute -top-2Or -top-2.5 border shadow-sm z-20 whitespace-nowrap",
                                isSelected
                                    ? "text-primary bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-800 -top-2.5"
                                    : "text-slate-500 bg-slate-100 dark:bg-white/10 dark:text-slate-400 border-slate-200 dark:border-slate-700 -top-2"
                            )}>
                                {topLabel}
                            </div>

                            <span className={cn(
                                "text-[9px] font-bold uppercase mt-3",
                                isSelected ? "text-primary" : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                            )}>
                                {month}
                            </span>
                            <span className={cn(
                                "text-xl font-bold -my-0.5",
                                isSelected ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-200"
                            )}>
                                {day}
                            </span>
                            <span className={cn(
                                "text-[9px] font-medium",
                                isSelected ? "text-slate-500 dark:text-slate-400" : "text-slate-500 dark:text-slate-400"
                            )}>
                                {weekDay}
                            </span>
                        </button>
                    );
                })}
                <div className="w-1 shrink-0"></div>
            </div>
        </div>
    );
}
