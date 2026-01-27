"use client";

import { cn } from "@/lib/utils";
import { ServiceFormState } from "@/models/services/ServiceEvent";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { Calendar, Loader2, History } from "lucide-react";
import { parseLocalDate } from "@/components/util/helper/helper-functions";
import { useEffect, useRef, useState } from "react";
import { CalendarDrawer } from "./calendar-drawer";

interface Props {
    schedules: ServiceFormState[];
    selectedScheduleId: string | null;
    onSelect: (scheduleId: string) => void;
    onLoadPrev?: () => void;
    isLoadingPrev?: boolean;
    hasMorePast?: boolean;
    currentUserUid?: string | null;
}

export function CalendarStrip({
    schedules,
    selectedScheduleId,
    onSelect,
    onLoadPrev,
    isLoadingPrev,
    hasMorePast = true,
    currentUserUid
}: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Effect to scroll selected item to start
    useEffect(() => {
        if (selectedScheduleId && itemRefs.current.has(selectedScheduleId)) {
            const el = itemRefs.current.get(selectedScheduleId);
            if (el) {
                el.scrollIntoView({ inline: "start", behavior: "smooth", block: "nearest" });
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

    const CARD_SIZE_CLASSES = "snap-start scroll-mx-4 shrink-0 w-[4.5rem] h-[5.5rem] rounded-xl flex flex-col items-center justify-center transition-colors relative";

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground">
                    {getMonthLabel()}
                </span>
                <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="text-primary text-[11px] font-bold uppercase hover:bg-muted px-2 py-1 rounded transition-colors tracking-wide flex items-center gap-1"
                >
                    CALENDAR
                    <Calendar className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 pt-4 snap-x snap-mandatory items-center scroll-smooth no-scrollbar"
            >
                {/* History Button (Load Past) */}
                {onLoadPrev && (
                    <HistoryButton
                        onLoadPrev={onLoadPrev}
                        isLoadingPrev={isLoadingPrev}
                        hasMorePast={hasMorePast}
                        baseClasses={CARD_SIZE_CLASSES}
                    />
                )}

                {/* Schedule Cards */}
                {schedules.map((schedule) => (
                    <DateCard
                        key={schedule.id}
                        schedule={schedule}
                        isSelected={schedule.id === selectedScheduleId}
                        onSelect={onSelect}
                        baseClasses={CARD_SIZE_CLASSES}
                        setRef={(el) => {
                            if (el) itemRefs.current.set(schedule.id, el);
                            else itemRefs.current.delete(schedule.id);
                        }}
                    />
                ))}
                <div className="w-1 shrink-0"></div>
            </div>

            <CalendarDrawer
                open={isCalendarOpen}
                onOpenChange={setIsCalendarOpen}
                schedules={schedules}
                selectedScheduleId={selectedScheduleId}
                onSelect={onSelect}
                currentUserUid={currentUserUid}
            />
        </div >
    );
}

// --- Sub-components ---

interface HistoryButtonProps {
    onLoadPrev: () => void;
    isLoadingPrev?: boolean;
    hasMorePast?: boolean;
    baseClasses: string;
}

function HistoryButton({ onLoadPrev, isLoadingPrev, hasMorePast = true, baseClasses }: HistoryButtonProps) {
    return (
        <button
            onClick={hasMorePast ? onLoadPrev : undefined}
            disabled={isLoadingPrev || !hasMorePast}
            className={cn(
                baseClasses,
                "group border",
                hasMorePast
                    ? "bg-panel dark:bg-panel-dark border-dashed border-border-light dark:border-border-dark hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer"
                    : "bg-muted/30 border-transparent opacity-50 cursor-default"
            )}
        >
            {isLoadingPrev ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
                <div className="flex flex-col items-center gap-1.5 pt-1">
                    <History className={cn("w-5 h-5", hasMorePast ? "text-muted-foreground group-hover:text-foreground" : "text-muted-foreground/50")} />
                    <span className={cn("text-[10px] font-bold leading-tight text-center uppercase tracking-wider", hasMorePast ? "text-muted-foreground group-hover:text-foreground" : "text-muted-foreground/50")}>
                        {hasMorePast ? "History" : "None"}
                    </span>
                </div>
            )}
        </button>
    );
}

interface DateCardProps {
    schedule: ServiceFormState;
    isSelected: boolean;
    onSelect: (id: string) => void;
    baseClasses: string;
    setRef: (el: HTMLButtonElement | null) => void;
}

import { differenceInCalendarDays } from "date-fns";

// ... (DateCardProps interface remains same)

function DateCard({ schedule, isSelected, onSelect, baseClasses, setRef }: DateCardProps) {
    const date = schedule.date instanceof Timestamp ? schedule.date.toDate() : parseLocalDate(schedule.date);
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

    // D-Day Calculation
    const today = new Date();
    const diffDays = differenceInCalendarDays(date, today);
    const isUpcoming = diffDays >= 0;

    // Format D-Day
    let dDayLabel = null;
    if (isUpcoming) {
        if (diffDays === 0) dDayLabel = "D-Day";
        else dDayLabel = `D-${diffDays}`;
    }

    return (
        <button
            ref={setRef}
            onClick={() => onSelect(schedule.id)}
            className={cn(
                baseClasses,
                "group",
                isSelected
                    ? "bg-white dark:bg-panel-dark border-[2px] border-primary shadow-lg shadow-blue-500/10 dark:shadow-none z-10 active:scale-95"
                    : "bg-panel dark:bg-panel-dark border border-border-light dark:border-border-dark hover:border-blue-300 dark:hover:border-blue-700 opacity-90"
            )}
        >
            {/* Pill Label */}
            <div className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full absolute -top-2.5 border shadow-sm z-20 whitespace-nowrap",
                isSelected
                    ? "text-primary bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-800"
                    : "text-muted-foreground bg-muted dark:bg-white/10 border-border-light dark:border-border-dark -top-2"
            )}>
                {topLabel}
            </div>

            <span className={cn(
                "text-[9px] font-bold uppercase mt-3",
                isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )}>
                {month}
            </span>
            <span className={cn(
                "text-xl font-bold -my-0.5",
                isSelected ? "text-foreground" : "text-foreground"
            )}>
                {day}
            </span>

            <div className="flex flex-col items-center leading-none mt-0.5">
                <span className="text-[9px] font-medium text-muted-foreground">
                    {weekDay}
                </span>
                {dDayLabel && (
                    <span className={cn(
                        "text-[9px] font-bold mt-0.5",
                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-blue-500/80"
                    )}>
                        {dDayLabel}
                    </span>
                )}
            </div>
        </button>
    );
}
