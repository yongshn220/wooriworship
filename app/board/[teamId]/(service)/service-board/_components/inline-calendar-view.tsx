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
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarItem } from "@/components/common/board-calendar/types";
import { MyAssignment } from "@/models/services/MyAssignment";

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

  // Sync current month when selection changes
  useEffect(() => {
    if (selectedId) {
      const selectedItem = items.find((item) => item.id === selectedId);
      if (selectedItem && !isSameMonth(selectedItem.date, currentMonth)) {
        setCurrentMonth(startOfMonth(selectedItem.date));
      }
    }
  }, [selectedId, items, currentMonth]);

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

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const events = eventsByDate.get(dateKey);
    if (events && events.length > 0) {
      onSelect(events[0].id);
    }
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full bg-card border border-border/30 rounded-xl overflow-hidden shadow-sm">
      {/* Header Navigation */}
      <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border-b border-border/30">
        <button
          onClick={handlePreviousMonth}
          className="p-1.5 hover:bg-background/60 rounded-md transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-foreground/70" />
        </button>
        <h2 className="text-sm font-bold tracking-tight text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-background/60 rounded-md transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-foreground/70" />
        </button>
      </div>

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
          const firstEvent = events[0];
          const isOutsideMonth = !isSameMonth(day, currentMonth);
          const isSelected = firstEvent && selectedId === firstEvent.id;
          const todayDate = isToday(day);
          const hasEvent = events.length > 0;
          const assignment = firstEvent
            ? assignmentMap.get(firstEvent.id)
            : null;
          const firstRole = assignment?.roles?.[0]?.roleName;

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              disabled={!hasEvent}
              className={cn(
                "relative h-[4.5rem] p-2 border-t border-r border-border/20 transition-all",
                "flex flex-col items-start gap-0.5",
                index % 7 === 0 && "border-l",
                isOutsideMonth && "opacity-30 bg-muted/5",
                !isOutsideMonth && "hover:bg-accent/30",
                isSelected &&
                  "ring-2 ring-primary ring-inset bg-primary/5 z-10",
                hasEvent && !isOutsideMonth && "cursor-pointer",
                !hasEvent && "cursor-default"
              )}
            >
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

              {/* Service Tag Badge */}
              {firstEvent && firstEvent.badgeLabel && (
                <div className="text-[9px] font-medium px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 truncate w-full shadow-sm border border-blue-200/30 dark:border-blue-800/30">
                  {firstEvent.badgeLabel}
                </div>
              )}

              {/* My Assignment Role */}
              {firstRole && (
                <div className="text-[8px] font-bold px-1 rounded bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-300 truncate w-full shadow-sm border border-orange-200/40 dark:border-orange-800/40">
                  {firstRole}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
