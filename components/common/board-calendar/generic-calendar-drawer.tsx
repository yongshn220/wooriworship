"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ResponsiveDrawer } from "@/components/ui/responsive-drawer";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, setMonth, setYear, getYear, getMonth, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { CalendarItem } from "./types";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: CalendarItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    /** Optional: filter by user assignment */
    assignedIds?: string[];
}

type ViewMode = "days" | "months" | "years";

export function GenericCalendarDrawer({
    open,
    onOpenChange,
    items,
    selectedId,
    onSelect,
    assignedIds
}: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>("days");
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [previewDate, setPreviewDate] = useState<Date | null>(null);

    // Initial load sync
    useEffect(() => {
        if (open) {
            if (selectedId) {
                const selected = items.find(s => s.id === selectedId);
                if (selected) {
                    setPreviewDate(selected.date);
                    setCurrentMonth(startOfMonth(selected.date));
                    return; // Found and set
                }
            }

            // Fallback to today if no selectedId or not found
            if (!previewDate) {
                const now = new Date();
                setPreviewDate(now);
                setCurrentMonth(startOfMonth(now));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Derived Data
    const datesWithItem = useMemo(() => items.map(s => s.date), [items]);
    const datesAssigned = useMemo(() => {
        if (!assignedIds) return [];
        return items
            .filter(s => assignedIds.includes(s.id))
            .map(s => s.date);
    }, [items, assignedIds]);

    const previewItems = useMemo(() => {
        if (!previewDate) return [];
        return items
            .filter(s => isSameDay(s.date, previewDate))
            .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }, [previewDate, items]);

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
    const modifiers = { hasSchedule: datesWithItem, isAssigned: datesAssigned };
    const modifiersClassNames = {
        hasSchedule: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-400 after:rounded-full",
        isAssigned: "font-bold text-primary relative before:absolute before:top-0.5 before:right-0.5 before:content-['★'] before:text-[8px] before:text-blue-600"
    };

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
            {/* Custom Header */}
            <div className="flex-none px-6 py-2 flex items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                        className={cn(
                            "text-lg font-bold transition-colors active:scale-95",
                            viewMode === "months" ? "text-primary" : "text-foreground hover:text-primary/80"
                        )}
                        aria-label="Toggle month selection"
                    >
                        {format(currentMonth, "MMMM")}
                    </button>

                    <button
                        onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                        className={cn(
                            "text-lg font-normal flex items-center gap-1 transition-colors active:scale-95",
                            viewMode === "years" ? "text-primary" : "text-muted-foreground hover:text-primary/80"
                        )}
                        aria-label="Toggle year selection"
                    >
                        {format(currentMonth, "yyyy")}
                        <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            (viewMode === "months" || viewMode === "years") && "rotate-180 text-primary"
                        )} />
                    </button>
                </div>

                {viewMode === "days" && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => setCurrentMonth(prev => setMonth(prev, getMonth(prev) - 1))}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => setCurrentMonth(prev => setMonth(prev, getMonth(prev) + 1))}
                            aria-label="Next month"
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
                        disableNavigation
                        classNames={{
                            month: "space-y-4",
                            caption: "hidden",
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

                    {previewItems.length > 0 ? (
                        previewItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border border-border/60 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer hover:border-primary/40 group"
                                onClick={() => handleConfirm(item.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                            {item.title || "No Title"}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                                                <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                                <span>{item.description}</span>
                                            </div>
                                        )}
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
