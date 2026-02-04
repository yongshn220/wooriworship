"use client";

import { cn } from "@/lib/utils";
import { format, differenceInCalendarDays } from "date-fns";
import { Loader2, History, ChevronRight, ChevronLeft } from "lucide-react";
import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import { CalendarItem } from "./types";
import { MyAssignment, MyAssignmentRole } from "@/models/services/MyAssignment";
import { useAnchorScroll } from "./use-anchor-scroll";

interface Props {
    items: CalendarItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onLoadPrev?: () => void;
    isLoadingPrev?: boolean;
    hasMorePast?: boolean;
    myAssignments?: MyAssignment[];
}

export function CalendarStrip({
    items,
    selectedId,
    onSelect,
    onLoadPrev,
    isLoadingPrev,
    hasMorePast = true,
    myAssignments,
}: Props) {
    const myAssignmentMap = useMemo(() => {
        if (!myAssignments) return new Map<string, MyAssignment>();
        const map = new Map<string, MyAssignment>();
        for (const a of myAssignments) map.set(a.serviceId, a);
        return map;
    }, [myAssignments]);

    const getRoleLabel = (role: MyAssignmentRole) => {
        if (role.source === 'flow') return role.flowItemTitle || role.roleName;
        return role.roleName;
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    // State to track direction of the selected item relative to the viewport
    const [selectionDirection, setSelectionDirection] = useState<'left' | 'right' | null>(null);

    // --- Anchor Scroll Logic ---
    const { captureAnchor, isRestoring } = useAnchorScroll({
        scrollContainerRef,
        itemsLength: items.length,
        itemRefs,
        isLoading: !!isLoadingPrev
    });

    // Wrapped handler
    const handleLoadPrev = () => {
        if (onLoadPrev && !isLoadingPrev && !isRestoring) {
            captureAnchor();
            onLoadPrev();
        }
    };

    // --- Scroll Management ---

    // 1. Scroll Check Handler
    const checkSelectionVisibility = () => {
        const container = scrollContainerRef.current;
        if (!container || !selectedId) {
            setSelectionDirection(null);
            return;
        }

        const selectedEl = itemRefs.current.get(selectedId);
        if (!selectedEl) return;

        const containerLeft = container.scrollLeft;
        const containerRight = containerLeft + container.clientWidth;

        const elLeft = selectedEl.offsetLeft;
        const elRight = elLeft + selectedEl.clientWidth;

        // Check visibility
        const isVisible = (elRight > containerLeft) && (elLeft < containerRight);

        if (isVisible) {
            setSelectionDirection(null);
        } else {
            // Determine direction
            if (elRight <= containerLeft) {
                // Element is to the LEFT
                setSelectionDirection('left');
            } else if (elLeft >= containerRight) {
                // Element is to the RIGHT
                setSelectionDirection('right');
            }
        }
    };

    // 2. Attach Scroll Listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const onScroll = () => {
            if (!isRestoring) { // Optional: debounce or throttle
                checkSelectionVisibility();
            }
        };

        container.addEventListener("scroll", onScroll);
        // Initial check
        checkSelectionVisibility();

        return () => container.removeEventListener("scroll", onScroll);
    }, [selectedId, items, isRestoring]);

    // 3. Auto-scroll to selection when selection changes OR when items change (e.g., mode switch)
    // Use instant scroll on first render, smooth on subsequent changes
    const isFirstScroll = useRef(true);
    const prevItemsLengthRef = useRef(items.length);
    useEffect(() => {
        if (selectedId && itemRefs.current.has(selectedId)) {
            const el = itemRefs.current.get(selectedId);
            if (el) {
                // Use instant scroll on first render or when items change (mode switch)
                const itemsChanged = prevItemsLengthRef.current !== items.length;
                const useInstant = isFirstScroll.current || itemsChanged;
                el.scrollIntoView({ inline: "start", behavior: useInstant ? "instant" : "smooth", block: "nearest" });
                isFirstScroll.current = false;
                prevItemsLengthRef.current = items.length;
            }
        }
    }, [selectedId, items.length]);


    // 4. "Back to Selection" Action
    const scrollToSelection = () => {
        if (selectedId && itemRefs.current.has(selectedId)) {
            const el = itemRefs.current.get(selectedId);
            if (el) {
                el.scrollIntoView({ inline: "center", behavior: "smooth" });
            }
        }
    };

    const CARD_CLASSES = "w-[5.5rem] h-[7rem] rounded-xl flex flex-col items-center justify-center transition-colors relative";
    const ITEM_WRAPPER = "snap-start scroll-mx-4 shrink-0 flex flex-col items-center gap-1";

    return (
        <div className="relative group/calendar-strip" data-testid="calendar-strip">
            {/* Horizontal Scroll Container */}
            <div
                ref={scrollContainerRef}
                style={{ overflowAnchor: "none" }}
                className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 pt-4 snap-x snap-mandatory items-center no-scrollbar relative"
            >
                {onLoadPrev && hasMorePast && (
                    <div className={ITEM_WRAPPER}>
                        <HistoryButton
                            onLoadPrev={handleLoadPrev}
                            isLoadingPrev={!!isLoadingPrev}
                            hasMorePast={hasMorePast}
                            baseClasses={CARD_CLASSES}
                        />
                    </div>
                )}

                {items.map((item, index) => {
                    const assignment = myAssignmentMap.get(item.id);
                    const firstRole = assignment?.roles?.find(r => getRoleLabel(r));
                    const roleLabel = firstRole ? getRoleLabel(firstRole) : null;
                    return (
                        <Fragment key={item.id}>
                            <div className={ITEM_WRAPPER}>
                                <DateCard
                                    item={item}
                                    isSelected={item.id === selectedId}
                                    onSelect={onSelect}
                                    baseClasses={CARD_CLASSES}
                                    setRef={(el) => {
                                        if (el) itemRefs.current.set(item.id, el);
                                        else itemRefs.current.delete(item.id);
                                    }}
                                />
                                <span className="text-[9px] font-bold text-primary truncate max-w-[5.5rem] text-center leading-tight h-[14px]">
                                    {roleLabel || '\u00A0'}
                                </span>
                            </div>
                        </Fragment>
                    );
                })}

                <div className="w-1 shrink-0"></div>
            </div>

            {/* Floating Back Buttons (Compass Logic) */}

            {/* Left Button (Go Back to Future basically, wait.. if selection is LEFT, we are in FUTURE. So arrow points LEFT) */}
            {selectionDirection === 'left' && (
                <button
                    onClick={scrollToSelection}
                    className="absolute left-0 top-1/2 -translate-y-1/2 mt-4 z-30 bg-card shadow-lg border border-border rounded-full p-2 min-h-touch min-w-touch flex items-center justify-center text-primary hover:bg-muted transition-all animate-in fade-in zoom-in slide-in-from-left-2 duration-200"
                    aria-label="Scroll left to selected date"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {/* Right Button (Go Back to Past basically, wait.. if selection is RIGHT, we are in PAST. So arrow points RIGHT) */}
            {selectionDirection === 'right' && (
                <button
                    onClick={scrollToSelection}
                    className="absolute right-0 top-1/2 -translate-y-1/2 mt-4 z-30 bg-card shadow-lg border border-border rounded-full p-2 min-h-touch min-w-touch flex items-center justify-center text-primary hover:bg-muted transition-all animate-in fade-in zoom-in slide-in-from-right-2 duration-200"
                    aria-label="Scroll right to selected date"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

        </div >
    );
}

// ... Sub-components (HistoryButton, DateCard) ...
// (I will inline them same as before, unchanged)

interface HistoryButtonProps {
    onLoadPrev: () => void;
    isLoadingPrev: boolean;
    hasMorePast: boolean;
    baseClasses: string;
}

function HistoryButton({ onLoadPrev, isLoadingPrev, hasMorePast, baseClasses }: HistoryButtonProps) {
    return (
        <button
            onClick={hasMorePast ? onLoadPrev : undefined}
            disabled={isLoadingPrev || !hasMorePast}
            className={cn(
                baseClasses,
                "group border",
                hasMorePast
                    ? "bg-panel dark:bg-panel-dark border-dashed border-border-light dark:border-border-dark hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer"
                    : "bg-muted/30 border-transparent opacity-50 cursor-default hidden"
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
    if (topLabel.length > 6) topLabel = topLabel.substring(0, 6);

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
            onClick={() => onSelect(item.id)}
            className={cn(
                baseClasses,
                "group",
                isSelected
                    ? "bg-white dark:bg-panel-dark border-[2px] border-primary shadow-lg shadow-blue-500/10 dark:shadow-none z-10 active:scale-95"
                    : cn(
                        "border border-border-light dark:border-border-dark hover:border-blue-300 dark:hover:border-blue-700",
                        isUpcoming
                            ? "bg-panel dark:bg-panel-dark opacity-90"
                            : "bg-muted/30 dark:bg-muted/10 opacity-60 grayscale-[0.3]"
                    )
            )}
        >
            <div className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full absolute -top-2.5 border shadow-sm z-20 whitespace-nowrap",
                isSelected
                    ? "text-primary bg-blue-50 dark:bg-blue-900/40 border-blue-100 dark:border-blue-800"
                    : "text-muted-foreground bg-muted dark:bg-white/10 border-border-light dark:border-border-dark -top-2"
            )}>
                {topLabel}
            </div>

            <span className={cn(
                "text-[11px] font-bold uppercase mt-3",
                isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )}>
                {month}
            </span>
            <span className={cn(
                "text-2xl font-bold -my-0.5",
                isSelected ? "text-foreground" : "text-foreground"
            )}>
                {day}
            </span>

            <div className="flex flex-col items-center leading-none mt-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                    {weekDay}
                </span>
                {dDayLabel && (
                    <span className={cn(
                        "text-[10px] font-bold mt-0.5",
                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-blue-500/80"
                    )}>
                        {dDayLabel}
                    </span>
                )}
            </div>

        </button>
    );
}
