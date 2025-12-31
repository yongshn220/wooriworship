"use client";

import React from "react";
import { format, addDays, nextFriday, nextSunday, isSaturday, isSunday, isFriday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { TagSelector } from "@/components/common/tag-selector";
import { FormSectionCard } from "@/components/common/form/full-screen-form";
import TeamService from "@/apis/TeamService";
import ServingService from "@/apis/ServingService";
import { useRecoilValue } from "recoil";
import { teamAtom } from "@/global-states/teamState";

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
    const [tagRefreshTrigger, setTagRefreshTrigger] = React.useState(0);
    const [tempKnownTags, setTempKnownTags] = React.useState<{ id: string, name: string }[]>([]);

    // Get team data for tags
    const team = useRecoilValue(teamAtom(teamId));
    const serviceTags = team?.service_tags || [];

    // --- Advanced Smart Quick Select (Learning Model V2) --- 
    const [shortcuts, setShortcuts] = React.useState<{ id: string | null, title: string, date: Date }[]>([]);

    React.useEffect(() => {
        const calculateSmartShortcuts = async () => {
            // Fetch fresh tags to ensure we have the latest list (Recoil might be stale)
            let currentServiceTags = serviceTags;
            try {
                const freshTeam = await TeamService.getById(teamId);
                if (freshTeam && freshTeam.service_tags) {
                    currentServiceTags = freshTeam.service_tags;
                }
            } catch (e) {
                console.warn("Failed to fetch fresh tags for smart select", e);
            }

            const now = new Date();
            const stats = await ServingService.getTagStats(teamId);
            const hasStats = Object.keys(stats).length > 0;

            let options: { id: string | null, title: string, date: Date, score: number }[] = [];

            // 1. Data-Driven Mode (Learning)
            if (hasStats) {
                // Determine top 3 tags by score
                const scoredTags = currentServiceTags.map(tag => {
                    const tagStat = stats[tag.id];
                    if (!tagStat) {
                        return { tag, score: 0, date: now };
                    }

                    // Score calculation: (0.4 * total_count) + (0.6 * recency_weight)
                    // Simple implementation: prioritize tags used recently (within 7 days) significantly
                    const lastUsed = new Date(tagStat.last_used_at);
                    const daysDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 3600 * 24);
                    const recencyScore = daysDiff <= 7 ? 50 : (daysDiff <= 30 ? 20 : 0);

                    const score = (tagStat.count * 1) + recencyScore;

                    // Determine primary weekday
                    let maxWeekday = 0; // Sunday default
                    let maxCount = -1;
                    let totalWeekdayCount = 0;

                    Object.entries(tagStat.weekdays || {}).forEach(([day, count]) => {
                        totalWeekdayCount += count;
                        if (count > maxCount) {
                            maxCount = count;
                            maxWeekday = parseInt(day);
                        }
                    });

                    // Multi-day detection (Range Tag): e.g., Dawn Prayer used Mon-Fri
                    // If max usage day is less than 50% of total usage, consider as "next weekday" type
                    const isRangeTag = (maxCount / totalWeekdayCount) < 0.5 && totalWeekdayCount > 5;

                    let predictedDate: Date;

                    if (isRangeTag) {
                        // For likely "daily/range" services, find next available weekday (Mon-Fri)
                        // Skipping today if already passed? For now just next valid weekday.
                        let d = addDays(now, 1);
                        // Skip Sat(6)/Sun(0)
                        while (d.getDay() === 0 || d.getDay() === 6) {
                            d = addDays(d, 1);
                        }
                        predictedDate = d;
                    } else {
                        // Fixed weekday prediction
                        const targetDay = maxWeekday;
                        const currentDay = now.getDay();

                        let daysUntil = targetDay - currentDay;
                        if (daysUntil <= 0) {
                            // If target is today or past, look for next week OR today if it fits
                            // Logic: if today is target day, propose TODAY.
                            if (daysUntil === 0) daysUntil = 0;
                            else daysUntil += 7;
                        }
                        predictedDate = addDays(now, daysUntil);
                    }

                    return { tag, score, date: predictedDate };
                });

                // Filter out score 0 and take top 3
                options = scoredTags
                    .filter(item => item.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map(item => ({
                        id: item.tag.id,
                        title: item.tag.name,
                        date: item.date,
                        score: item.score
                    }));
            }

            // 2. Fallback Mode (Heuristic Rule) - Fill empty slots
            if (options.length < 3) {
                // Helper to find a tag by keyword
                const findTag = (keywords: string[]) => {
                    return currentServiceTags.find(t => keywords.some(k => t.name.toLowerCase().includes(k.toLowerCase())));
                };

                const dawnTag = findTag(["새벽", "Dawn", "Morning"]);
                const fridayTag = findTag(["금요", "Friday"]);
                const sundayTag = findTag(["주일", "Sunday"]);

                const heuristics = [
                    {
                        id: sundayTag?.id || null,
                        title: sundayTag?.name || "주일예배",
                        date: isSunday(now) ? now : nextSunday(now),
                        role: 'sunday'
                    },
                    {
                        id: fridayTag?.id || null,
                        title: fridayTag?.name || "금요예배",
                        date: isFriday(now) ? now : nextFriday(now),
                        role: 'friday'
                    },
                    {
                        id: dawnTag?.id || null,
                        title: dawnTag?.name || "새벽예배",
                        date: (() => {
                            let d = addDays(now, 1);
                            while (isSaturday(d) || isSunday(d)) {
                                d = addDays(d, 1);
                            }
                            return d;
                        })(),
                        role: 'dawn'
                    }
                ];

                for (const h of heuristics) {
                    if (options.length >= 3) break;
                    // Avoid duplicates by ID or Title (approximate check)
                    const exists = options.some(o => (o.id && o.id === h.id) || o.title === h.title);
                    if (!exists) {
                        options.push({ ...h, score: 0 });
                    }
                }
            }

            // sort by date for display
            setShortcuts(options.sort((a, b) => a.date.getTime() - b.date.getTime()));
        };

        calculateSmartShortcuts();
    }, [teamId, serviceTags, tagRefreshTrigger]);

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
                        refreshTrigger={tagRefreshTrigger}
                        knownTags={tempKnownTags}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {shortcuts.map((option) => {
                        const isSelected = !!date && isSameDay(date, option.date) && (
                            (!!option.id && serviceTagIds.includes(option.id)) ||
                            (!option.id && tempKnownTags.some(t => t.name === option.title && serviceTagIds.includes(t.id)))
                        );

                        return (
                            <button
                                key={option.title + option.date.toString()}
                                onClick={async (e) => {
                                    // Blur to prevent focus holding (which seems to block calendar nav in some cases)
                                    e.currentTarget.blur();
                                    onDateChange(option.date);
                                    setCurrentMonth(option.date);

                                    let tagId = option.id;

                                    // If tag doesn't exist (ID is null), create it using the default name
                                    // This only happens for fallback heuristic options
                                    if (!tagId) {
                                        tagId = await TeamService.addServiceTag(teamId, option.title);
                                        if (tagId) {
                                            setTempKnownTags(prev => [...prev, { id: tagId!, name: option.title }]);
                                            setTagRefreshTrigger(prev => prev + 1);
                                        }
                                    }

                                    if (tagId) {
                                        onServiceTagIdsChange([tagId]);
                                    }
                                }}
                                className={cn(
                                    "relative px-4 py-2.5 rounded-[20px] text-[11px] font-bold transition-all active:scale-95 border flex flex-col items-center justify-center gap-0.5 h-auto min-w-[100px]",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90"
                                        : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-0 duration-200" />
                                )}
                                <span className={cn("text-[10px] font-medium", isSelected ? "text-primary-foreground/80" : "text-gray-400")}>
                                    {format(option.date, "M/d (eee)")}
                                </span>
                                <span className="text-sm">{option.title}</span>
                            </button>
                        );
                    })}
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
