"use client";

import React from "react";
import { format, addDays, nextFriday, nextSunday, isSaturday, isSunday } from "date-fns";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { TagSelector } from "@/components/common/tag-selector";
import { FormSectionCard } from "@/components/common/form/full-screen-form";
import TeamService from "@/apis/TeamService";

interface ServiceDateSelectorProps {
    teamId: string;
    serviceTagIds: string[];
    onServiceTagIdsChange: (serviceTagIds: string[]) => void;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    calendarMonth?: Date;
    onCalendarMonthChange?: (date: Date) => void;
}

export function ServiceDateSelector({
    teamId,
    serviceTagIds,
    onServiceTagIdsChange,
    date,
    onDateChange,
    calendarMonth,
    onCalendarMonthChange,
}: ServiceDateSelectorProps) {

    // Internal state for calendar month if not provided
    const [internalMonth, setInternalMonth] = React.useState<Date>(date || new Date());
    const currentMonth = calendarMonth || internalMonth;
    const setCurrentMonth = onCalendarMonthChange || setInternalMonth;

    return (
        <div className="space-y-6">
            {/* Service Selection Card */}
            <FormSectionCard>
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground ml-1">Service</Label>
                    <TagSelector
                        teamId={teamId}
                        selectedTags={serviceTagIds}
                        onTagsChange={onServiceTagIdsChange}
                        placeholder="Select service (e.g. 주일예배, 금요예배...)"
                        single={true}
                        mode="service"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        {
                            date: (() => {
                                let d = addDays(new Date(), 1);
                                while (isSaturday(d) || isSunday(d)) {
                                    d = addDays(d, 1);
                                }
                                return d;
                            })(),
                            title: "새벽예배"
                        },
                        {
                            date: nextFriday(new Date()),
                            title: "금요예배"
                        },
                        {
                            date: nextSunday(new Date()),
                            title: "주일예배"
                        }
                    ].sort((a, b) => a.date.getTime() - b.date.getTime()).map((option) => (
                        <button
                            key={option.title}
                            onClick={async () => {
                                onDateChange(option.date);
                                setCurrentMonth(option.date);
                                // Auto-create tag if it doesn't exist and get ID
                                const id = await TeamService.addServiceTag(teamId, option.title);
                                if (id) {
                                    onServiceTagIdsChange([id]);
                                }
                            }}
                            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold hover:bg-blue-100 hover:border-blue-200 transition-all active:scale-95"
                        >
                            {format(option.date, "MM-dd")} {option.title}
                        </button>
                    ))}
                </div>
            </FormSectionCard>

            {/* Date Selection Card */}
            <FormSectionCard className="flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between ml-1">
                    <Label className="text-sm font-semibold text-muted-foreground">Date</Label>
                    {date && (
                        <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">
                            {format(date, "yyyy-MM-dd (eee)")}
                        </span>
                    )}
                </div>
                <Calendar
                    mode="single"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    selected={date}
                    onSelect={(d) => {
                        if (d) {
                            onDateChange(d);
                        }
                    }}
                    className="rounded-2xl border-0"
                />
            </FormSectionCard>
        </div>
    );
}
