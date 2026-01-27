"use client";

import React from "react";
import { format, addDays, nextFriday, nextSunday, isSaturday, isSunday, isFriday, isSameDay } from "date-fns";
import { timestampToDateString } from "@/components/util/helper/helper-functions";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { TagSelector } from "@/components/common/tag-selector";
import { FormSectionCard } from "@/components/common/form/full-screen-form";
import TeamService from "@/apis/TeamService";
import { ServiceEventService } from "@/apis/ServiceEventService";
import { teamAtom, fetchServiceTagsSelector, serviceTagsUpdaterAtom } from "@/global-states/teamState";
import { Team } from "@/models/team";
import { useRecoilValue, useSetRecoilState } from "recoil";

interface ServiceDateSelectorProps {
    teamId: string;
    tagId: string;
    onTagIdChange: (tagId: string) => void;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    calendarMonth?: Date;
    onCalendarMonthChange?: (date: Date) => void;
}

export function ServiceDateSelector({
    teamId,
    tagId,
    onTagIdChange,
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
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId));
    const setTagRefresh = useSetRecoilState(serviceTagsUpdaterAtom);

    // --- Advanced Smart Quick Select (Learning Model V2) --- 
    const [shortcuts, setShortcuts] = React.useState<{ id: string | null, title: string, date: Date }[]>([]);

    React.useEffect(() => {
        const calculateSmartShortcuts = async () => {
            // Refresh is handled by serviceTags dependency in Recoil
            const now = new Date();
            const stats = await ServiceEventService.getTagStats(teamId);
            const hasStats = Object.keys(stats).length > 0;

            let options: { id: string | null, title: string, date: Date, score: number }[] = [];

            if (hasStats) {
                // Determine top 3 tags by score
                const scoredTags = serviceTags.map(tag => {
                    const tagStat = stats[tag.id];
                    if (!tagStat) {
                        return { tag, score: 0, maxWeekday: 0 };
                    }

                    // Score calculation: (0.4 * total_count) + (0.6 * recency_weight)
                    const lastUsed = new Date(tagStat.last_used_at);
                    const daysDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 3600 * 24);
                    const recencyScore = daysDiff <= 7 ? 50 : (daysDiff <= 30 ? 20 : 0);

                    const score = (tagStat.count * 1) + recencyScore;

                    // Fallback weekday from stats (if no recent history fetched later)
                    let maxWeekday = 0;
                    let maxCount = -1;
                    Object.entries(tagStat.weekdays || {}).forEach(([day, count]) => {
                        const countNum = count as number;
                        if (countNum > maxCount) {
                            maxCount = countNum;
                            maxWeekday = parseInt(day);
                        }
                    });

                    return { tag, score, maxWeekday };
                });

                // Take top 3 candidates
                const topCandidates = scoredTags
                    .filter(item => item.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);

                // Fetch real recent history for these candidates to get accurate weekday trend
                // This overrides historical aggregate data which might be polluted or outdated
                const resolvedOptions = await Promise.all(topCandidates.map(async (item) => {
                    let targetWeekday = item.maxWeekday;

                    try {
                        // Fetch last 5 usages (V3)
                        const recent = await ServiceEventService.getRecentServicesWithFlows(teamId, item.tag.id, 5);
                        if (recent.length > 0) {
                            // Calculate mode weekday from recent schedules
                            const dayCounts: Record<number, number> = {};
                            recent.forEach(s => {
                                const dateStr = typeof s.date === 'string' ? s.date : timestampToDateString(s.date);
                                const [y, m, d] = dateStr.split('-').map(Number); // Safe local parsing
                                const day = new Date(y, m - 1, d).getDay();
                                dayCounts[day] = (dayCounts[day] || 0) + 1;
                            });

                            let bestDay = -1;
                            let bestCount = -1;
                            Object.entries(dayCounts).forEach(([day, count]) => {
                                if (count > bestCount) {
                                    bestCount = count;
                                    bestDay = parseInt(day);
                                }
                            });

                            if (bestDay !== -1) {
                                targetWeekday = bestDay;
                            }
                        }
                    } catch (e) {
                        console.warn("Failed to fetch recent history for tag", item.tag.name);
                    }

                    // Calculate predicted date based on targetWeekday
                    // Logic: Find next occurrence of targetWeekday
                    const currentDay = now.getDay();
                    let daysUntil = targetWeekday - currentDay;

                    // If target is today, we suggest today unless it's late? 
                    // For simplicity, if today is the day, suggest today.
                    if (daysUntil < 0) {
                        daysUntil += 7;
                    }

                    const predictedDate = addDays(now, daysUntil);

                    return {
                        id: item.tag.id,
                        title: item.tag.name,
                        date: predictedDate,
                        score: item.score
                    };
                }));

                options = resolvedOptions;
            }

            // 2. Fallback Mode (Heuristic Rule) - Fill empty slots
            if (options.length < 3) {
                const findTag = (keywords: string[]) => {
                    return serviceTags.find(t => keywords.some(k => t.name.toLowerCase().includes(k.toLowerCase())));
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
    }, [teamId, serviceTags]);

    return (
        <div className="space-y-6">
            {/* Service Selection Card */}
            <FormSectionCard>
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground ml-1">Service</Label>
                    <TagSelector
                        teamId={teamId}
                        selectedTags={tagId ? [tagId] : []}
                        onTagsChange={(tags) => onTagIdChange(tags[0] || "")}
                        placeholder="Select Service"
                        single={true}
                        mode="service"
                        refreshTrigger={tagRefreshTrigger}
                        knownTags={tempKnownTags}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {shortcuts.map((option) => {
                        const isSelected = !!date && isSameDay(date, option.date) && (
                            (!!option.id && tagId === option.id) ||
                            (!option.id && tempKnownTags.some(t => t.name === option.title && tagId === t.id))
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
                                            setTagRefresh(prev => prev + 1);
                                        }
                                    }

                                    if (tagId) {
                                        onTagIdChange(tagId);
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
