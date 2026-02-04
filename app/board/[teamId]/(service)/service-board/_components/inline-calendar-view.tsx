"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  setMonth,
  setYear,
  getYear,
  getMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarItem } from "@/components/common/board-calendar/types";
import { MyAssignment } from "@/models/services/MyAssignment";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface InlineCalendarViewProps {
  items: CalendarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  myAssignments?: MyAssignment[];
}

export function InlineCalendarView({
  items,
  selectedId,
  onSelect,
  myAssignments,
}: InlineCalendarViewProps) {
  // Initialize to selected item's month, or today
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedId) {
      const selectedItem = items.find((item) => item.id === selectedId);
      if (selectedItem) return startOfMonth(selectedItem.date);
    }
    return startOfMonth(new Date());
  });

  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [openPopoverKey, setOpenPopoverKey] = useState<string | null>(null);

  // Sync current month when selection changes (NOT when month changes)
  useEffect(() => {
    if (selectedId) {
      const selectedItem = items.find((item) => item.id === selectedId);
      if (selectedItem) {
        setCurrentMonth(startOfMonth(selectedItem.date));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Build event map: dateString -> CalendarItem[]
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = format(item.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [items]);

  // Build assignment map: serviceId -> MyAssignment
  const assignmentMap = useMemo(() => {
    if (!myAssignments) return new Map<string, MyAssignment>();
    const map = new Map<string, MyAssignment>();
    for (const assignment of myAssignments) {
      map.set(assignment.serviceId, assignment);
    }
    return map;
  }, [myAssignments]);

  // Generate all days for the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart); // Sunday
    const calEnd = endOfWeek(monthEnd); // Saturday
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleGoToToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
  };

  const isCurrentMonthToday = isSameMonth(currentMonth, new Date());

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const events = eventsByDate.get(dateKey);
    if (events && events.length === 1) {
      onSelect(events[0].id);
    }
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = getYear(currentMonth);
  const years = Array.from({ length: 11 }, (_, i) => year - 5 + i);

  const handleMonthSelect = (m: number) => {
    setCurrentMonth(prev => setMonth(prev, m));
    setViewMode("days");
  };

  const handleYearSelect = (y: number) => {
    setCurrentMonth(prev => setYear(prev, y));
    setViewMode("months");
  };

  return (
    <div className="w-full bg-card border border-border/30 rounded-xl overflow-hidden shadow-sm">
      {/* Header Navigation */}
      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
            className={cn(
              "text-sm font-bold tracking-tight transition-colors active:scale-95",
              viewMode === "months" ? "text-primary" : "text-foreground hover:text-primary/80"
            )}
          >
            {format(currentMonth, "MMMM")}
          </button>
          <button
            onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
            className={cn(
              "text-sm font-normal flex items-center gap-0.5 transition-colors active:scale-95",
              viewMode === "years" ? "text-primary" : "text-muted-foreground hover:text-primary/80"
            )}
          >
            {format(currentMonth, "yyyy")}
            <ChevronDown className={cn(
              "h-3.5 w-3.5 transition-transform",
              (viewMode === "months" || viewMode === "years") && "rotate-180 text-primary"
            )} />
          </button>
        </div>

        {viewMode === "days" && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePreviousMonth}
              className="p-1.5 hover:bg-background/60 rounded-md transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-foreground/70" />
            </button>
            <button
              onClick={handleGoToToday}
              className={cn(
                "px-2 py-1 rounded-md text-xs font-semibold transition-all",
                isCurrentMonthToday
                  ? "text-muted-foreground/40 cursor-default"
                  : "text-primary hover:bg-primary/10 active:scale-95"
              )}
              aria-label="Go to today"
              disabled={isCurrentMonthToday}
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-background/60 rounded-md transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-foreground/70" />
            </button>
          </div>
        )}
      </div>

      {/* Calendar Content */}
      {viewMode === "days" && (
        <>
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-muted/20 border-b border-border/20">
            {weekdays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 animate-in fade-in duration-200">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const events = eventsByDate.get(dateKey) || [];
              const isOutsideMonth = !isSameMonth(day, currentMonth);
              const todayDate = isToday(day);
              const hasEvent = events.length > 0;
              const hasMultipleEvents = events.length > 1;
              const isAnySelected = events.some(e => e.id === selectedId);

              // For single-event days, show assignment role in cell
              const singleEvent = events.length === 1 ? events[0] : null;
              const singleAssignment = singleEvent ? assignmentMap.get(singleEvent.id) : null;
              const singleRole = singleAssignment?.roles?.find(r => r.roleName);
              const singleRoleLabel = singleRole
                ? (singleRole.source === 'flow' ? singleRole.flowItemTitle || singleRole.roleName : singleRole.roleName)
                : null;

              const cellClassName = cn(
                "relative min-h-[4.5rem] p-2 border-t border-r border-border/20 transition-all",
                "flex flex-col items-start gap-0.5",
                index % 7 === 0 && "border-l",
                isOutsideMonth && "opacity-30 bg-muted/5",
                !isOutsideMonth && "hover:bg-accent/30",
                isAnySelected && "ring-2 ring-primary ring-inset bg-primary/5 z-10",
                hasEvent && !isOutsideMonth && "cursor-pointer",
                !hasEvent && "cursor-default"
              );

              const cellContent = (
                <>
                  {/* Day Number */}
                  <div
                    className={cn(
                      "text-xs font-medium leading-none",
                      todayDate
                        ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                        : "text-foreground/80"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  {/* Service Tag Badges - Vertical List */}
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-[9px] font-medium px-1 py-0.5 rounded truncate w-full shadow-sm border",
                        selectedId === event.id
                          ? "bg-primary/15 text-primary border-primary/30 dark:bg-primary/20"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200/30 dark:border-blue-800/30"
                      )}
                    >
                      {event.badgeLabel}
                    </div>
                  ))}

                  {/* My Assignment Role (single event only) */}
                  {singleRoleLabel && (
                    <div className="text-[8px] font-bold px-1 rounded bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-300 truncate w-full shadow-sm border border-orange-200/40 dark:border-orange-800/40">
                      {singleRoleLabel}
                    </div>
                  )}
                </>
              );

              // Multi-event days: Popover for service selection
              if (hasMultipleEvents && !isOutsideMonth) {
                return (
                  <Popover
                    key={day.toISOString()}
                    open={openPopoverKey === dateKey}
                    onOpenChange={(open) => setOpenPopoverKey(open ? dateKey : null)}
                  >
                    <PopoverTrigger asChild>
                      <button className={cellClassName}>
                        {cellContent}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1.5" align="center" sideOffset={4}>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] font-medium text-muted-foreground px-2 py-1">
                          {format(day, "M월 d일")}
                        </p>
                        {events.map((event) => {
                          const eventAssignment = assignmentMap.get(event.id);
                          const eventRole = eventAssignment?.roles?.find(r => r.roleName);
                          const eventRoleLabel = eventRole
                            ? (eventRole.source === 'flow' ? eventRole.flowItemTitle || eventRole.roleName : eventRole.roleName)
                            : null;

                          return (
                            <button
                              key={event.id}
                              onClick={() => {
                                onSelect(event.id);
                                setOpenPopoverKey(null);
                              }}
                              className={cn(
                                "text-left px-2.5 py-2 rounded-lg text-sm transition-colors",
                                selectedId === event.id
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "hover:bg-accent text-foreground"
                              )}
                            >
                              <div className="font-medium">{event.badgeLabel}</div>
                              {eventRoleLabel && (
                                <div className="text-[11px] text-orange-500 dark:text-orange-400 mt-0.5">
                                  {eventRoleLabel}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              // Single or no event: simple button
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasEvent}
                  className={cellClassName}
                >
                  {cellContent}
                </button>
              );
            })}
          </div>
        </>
      )}

      {viewMode === "months" && (
        <div className="grid grid-cols-3 gap-2 p-4 animate-in fade-in zoom-in duration-200">
          {months.map((m, idx) => (
            <button
              key={m}
              onClick={() => handleMonthSelect(idx)}
              className={cn(
                "h-12 flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-accent active:scale-95",
                getMonth(currentMonth) === idx ? "bg-primary text-primary-foreground" : "text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {viewMode === "years" && (
        <div className="grid grid-cols-3 gap-2 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
  );
}
