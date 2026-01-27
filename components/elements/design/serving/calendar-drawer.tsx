"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { Calendar } from "@/components/ui/calendar";
import { ServiceFormState } from "@/models/services/ServiceEvent";
import { Timestamp } from "firebase/firestore";
import { parseLocalDate } from "@/components/util/helper/helper-functions";
import { format, isSameDay, setMonth, setYear, getYear, getMonth, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedules: ServiceFormState[];
    selectedScheduleId: string | null;
    onSelect: (scheduleId: string) => void;
    currentUserUid?: string | null;
}

type ViewMode = "days" | "months" | "years";

export function CalendarDrawer({
    open,
    onOpenChange,
    schedules,
    selectedScheduleId,
    onSelect,
    currentUserUid
}: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("days");
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [previewDate, setPreviewDate] = useState<Date | null>(null);

    // Initial load sync
    useEffect(() => {
        if (open && selectedScheduleId) {
            const schedule = schedules.find(s => s.id === selectedScheduleId);
            if (schedule) {
                const date = parseDate(schedule.date);
                setPreviewDate(date);
                setCurrentMonth(startOfMonth(date));
            }
        } else if (open && !previewDate) {
            const now = new Date();
            setPreviewDate(now);
            setCurrentMonth(startOfMonth(now));
        }
    }, [open, selectedScheduleId, schedules, previewDate]);

    // Helpers
    const parseDate = (d: string | Timestamp) => d instanceof Timestamp ? d.toDate() : parseLocalDate(d);

    // Derived Data
    const datesWithSchedule = useMemo(() => schedules.map(s => parseDate(s.date)), [schedules]);
    const datesAssignedToUser = useMemo(() => {
        if (!currentUserUid) return [];
        return schedules
            .filter(s => {
                const legacyAssigned = s.roles?.some(r => r.memberIds.includes(currentUserUid));
                const worshipAssigned = s.worship_roles?.some(r => r.memberIds.includes(currentUserUid));
                return legacyAssigned || worshipAssigned;
            })
            .map(s => parseDate(s.date));
    }, [schedules, currentUserUid]);

    const previewSchedules = useMemo(() => {
        if (!previewDate) return [];
        return schedules
            .filter(s => isSameDay(parseDate(s.date), previewDate))
            .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }, [previewDate, schedules]);

    // Selection Handlers
    const handleDateSelect = (date: Date | undefined) => {
        if (date) setPreviewDate(date);
    };

    const handleMonthSelect = (m: number) => {
        setCurrentMonth(prev => setMonth(prev, m));
        setViewMode("days");
    };

    const handleYearSelect = (y: number) => {
        setCurrentMonth(prev => setYear(prev, y));
        setViewMode("months");
    };

    const handleConfirm = (id: string) => {
        onSelect(id);
        onOpenChange(false);
    };

    // Calendar Modifiers
    const modifiers = { hasSchedule: datesWithSchedule, isAssigned: datesAssignedToUser };
    const modifiersClassNames = {
        hasSchedule: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-400 after:rounded-full",
        isAssigned: "font-bold text-primary relative before:absolute before:top-0.5 before:right-0.5 before:content-['★'] before:text-[8px] before:text-blue-600"
    };

    // Picker Data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = getYear(currentMonth);
    const years = Array.from({ length: 11 }, (_, i) => year - 5 + i);

    return (
        <ResponsiveDrawer
            open={open}
            onOpenChange={onOpenChange}
            className="h-[75vh]"
            contentClassName="flex flex-col h-full !p-0"
        >
            {/* Custom Premium Header */}
            <div className="flex-none px-6 py-2 flex items-center justify-between border-b border-border/50">
                <div
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity active:scale-95"
                    onClick={() => setViewMode(viewMode === "days" ? "months" : "days")}
                >
                    <span className="text-lg font-bold text-foreground">
                        {format(currentMonth, "MMMM")}
                    </span>
                    <span className="text-lg font-normal text-muted-foreground">
                        {format(currentMonth, "yyyy")}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", viewMode !== "days" && "rotate-180")} />
                </div>

                {viewMode === "days" && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => setCurrentMonth(prev => setMonth(prev, getMonth(prev) - 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => setCurrentMonth(prev => setMonth(prev, getMonth(prev) + 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-none w-full flex justify-center py-4 min-h-[300px] relative">
                {viewMode === "days" && (
                    <Calendar
                        mode="single"
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        selected={previewDate || undefined}
                        onSelect={handleDateSelect}
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        className="p-0"
                        showOutsideDays={false}
                        disableNavigation // We use our custom header nav
                        classNames={{
                            month: "space-y-4",
                            caption: "hidden", // Hide native header
                            table: "w-[300px] border-collapse space-y-1",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2 justify-between",
                            cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg hover:bg-accent",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent/50 text-accent-foreground",
                        }}
                    />
                )}

                {viewMode === "months" && (
                    <div className="w-[300px] grid grid-cols-3 gap-2 px-4 animate-in fade-in zoom-in duration-200">
                        {months.map((m, idx) => (
                            <button
                                key={m}
                                onClick={() => handleMonthSelect(idx)}
                                className={cn(
                                    "h-14 flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-accent active:scale-95",
                                    getMonth(currentMonth) === idx ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}
                            >
                                {m}
                            </button>
                        ))}
                        <button
                            onClick={() => setViewMode("years")}
                            className="col-span-3 h-10 mt-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                        >
                            Change Year <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {viewMode === "years" && (
                    <div className="w-[300px] grid grid-cols-3 gap-2 px-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {years.map((y) => (
                            <button
                                key={y}
                                onClick={() => handleYearSelect(y)}
                                className={cn(
                                    "h-12 flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-accent active:scale-95",
                                    getYear(currentMonth) === y ? "bg-primary text-primary-foreground" : "text-foreground"
                                )}
                            >
                                {y}
                            </button>
                        ))}
                        <button
                            onClick={() => setViewMode("months")}
                            className="col-span-3 h-10 mt-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                            Back to Months
                        </button>
                    </div>
                )}
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-muted/5 dark:bg-muted/10 border-t border-border/30">
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    {previewDate && (
                        <div className="text-xs font-bold text-muted-foreground/60 px-1 uppercase tracking-wider">
                            {format(previewDate, "EEEE, MMM d")}
                        </div>
                    )}

                    {previewSchedules.length > 0 ? (
                        previewSchedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="bg-card border border-border/60 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer hover:border-primary/40 group"
                                onClick={() => handleConfirm(schedule.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                            {schedule.title || "Worship Service"}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                                            <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-md">
                                                {format(parseDate(schedule.date), "HH:mm")}
                                            </span>
                                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                            <span>
                                                {schedule.worship_roles?.length || 0} worship roles
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                            <div className="text-sm font-medium">No schedules found</div>
                        </div>
                    )}
                </div>
            </div>
        </ResponsiveDrawer>
    );
}
