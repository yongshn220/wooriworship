"use client";

import { cn } from "@/lib/utils";
import { format, differenceInCalendarDays } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CalendarItem } from "./types";
import { GenericCalendarDrawer } from "./generic-calendar-drawer";
import { useAnchorScroll } from "./use-anchor-scroll";

interface Props {
    items: CalendarItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onLoadPrev?: () => void;
    isLoadingPrev?: boolean;
    hasMorePast?: boolean;
    calendarDrawerTitle?: string;
}

export function CalendarStrip({
    items,
    selectedId,
    onSelect,
    onLoadPrev,
    isLoadingPrev,
    hasMorePast = true,
}: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // --- Anchor Scroll Logic ---
    const { captureAnchor } = useAnchorScroll({
        scrollContainerRef,
        itemsLength: items.length,
        itemRefs,
        isLoading: !!isLoadingPrev
    });

    // --- Sentinel Observation ---
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = (node: HTMLDivElement | null) => {
        if (observerRef.current) observerRef.current.disconnect();

        // Only observe if we can load more
        if (node && onLoadPrev && hasMorePast) {
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !isLoadingPrev) {
                    // 1. Capture the current visual anchor before loading starts
                    captureAnchor();
                    // 2. Trigger Load
                    onLoadPrev();
                }
            }, {
                root: scrollContainerRef.current,
                threshold: 0.1,
                // Trigger when sentinel is close (e.g., 300px)
                rootMargin: "0px 0px 0px 300px"
            });
            observerRef.current.observe(node);
        }
    };

    const getMonthLabel = () => {
        if (selectedId) {
            const selected = items.find(s => s.id === selectedId);
            if (selected) {
                return format(selected.date, "MMMM yyyy");
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
                style={{ overflowAnchor: "none" }}
                className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 pt-4 snap-x snap-mandatory items-center no-scrollbar"
            >
                {/* Sentinel / Loader */}
                {hasMorePast && (
                    <div
                        ref={sentinelRef}
                        className={cn(CARD_SIZE_CLASSES, "bg-transparent border-transparent")}
                    >
                        {isLoadingPrev ? (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="w-full h-full" />
                        )}
                    </div>
                )}

                {/* Items */}
                {items.map((item) => (
                    <DateCard
                        key={item.id}
                        item={item}
                        isSelected={item.id === selectedId}
                        onSelect={onSelect}
                        baseClasses={CARD_SIZE_CLASSES}
                        setRef={(el) => {
                            if (el) itemRefs.current.set(item.id, el);
                            else itemRefs.current.delete(item.id);
                        }}
                    />
                ))}

                <div className="w-1 shrink-0"></div>
            </div>

            <GenericCalendarDrawer
                open={isCalendarOpen}
                onOpenChange={setIsCalendarOpen}
                items={items}
                selectedId={selectedId}
                onSelect={onSelect}
            />
        </div >
    );
}

interface DateCardProps {
    item: CalendarItem;
    isSelected: boolean;
    onSelect: (id: string) => void;
    baseClasses: string;
    setRef: (el: HTMLButtonElement | null) => void;
}

function DateCard({ item, isSelected, onSelect, baseClasses, setRef }: DateCardProps) {
    const day = format(item.date, "d");
    const month = format(item.date, "MMM");
    const weekDay = format(item.date, "EEE");

    let topLabel = item.badgeLabel || "Event";
    if (topLabel.length > 5) topLabel = topLabel.substring(0, 5);

    const today = new Date();
    const diffDays = differenceInCalendarDays(item.date, today);
    const isUpcoming = diffDays >= 0;

    let dDayLabel = null;
    if (isUpcoming) {
        if (diffDays === 0) dDayLabel = "D-Day";
        else dDayLabel = `D-${diffDays}`;
    }

    return (
        <button
            ref={setRef}
            dir="ltr"
            onClick={() => onSelect(item.id)}
            className={cn(
                baseClasses,
                "group",
                isSelected
                    ? "bg-white dark:bg-panel-dark border-[2px] border-primary shadow-lg shadow-blue-500/10 dark:shadow-none z-10 active:scale-95"
                    : "bg-panel dark:bg-panel-dark border border-border-light dark:border-border-dark hover:border-blue-300 dark:hover:border-blue-700 opacity-90"
            )}
        >
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
