"use client";

import React from "react";
import { format, addDays, nextFriday, nextSunday, isSaturday, isSunday, isFriday, isSameDay } from "date-fns";
import { timestampToDateString } from "@/components/util/helper/helper-functions";
import { cn } from "@/lib/utils";
import TeamApi from "@/apis/TeamApi";
import { ServiceEventApi } from "@/apis/ServiceEventApi";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { fetchServiceTagsSelector, serviceTagsUpdaterAtom } from "@/global-states/teamState";

interface QuickServiceSelectProps {
    teamId: string;
    tagId: string;
    onTagIdChange: (tagId: string) => void;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
    onMonthChange: (date: Date) => void;
}

export function QuickServiceSelect({
    teamId,
    tagId,
    onTagIdChange,
    date,
    onDateChange,
    onMonthChange,
}: QuickServiceSelectProps) {
    const serviceTags = useRecoilValue(fetchServiceTagsSelector(teamId));
    const setTagRefresh = useSetRecoilState(serviceTagsUpdaterAtom);
    const [shortcuts, setShortcuts] = React.useState<{ id: string | null, title: string, date: Date }[]>([]);

    React.useEffect(() => {
        const calculateSmartShortcuts = async () => {
            const now = new Date();
            const stats = await ServiceEventApi.getTagStats(teamId);
            const hasStats = Object.keys(stats).length > 0;

            let options: { id: string | null, title: string, date: Date, score: number }[] = [];

            if (hasStats) {
                const scoredTags = serviceTags.map(tag => {
                    const tagStat = stats[tag.id];
                    if (!tagStat) {
                        return { tag, score: 0, maxWeekday: 0 };
                    }

                    const lastUsed = new Date(tagStat.last_used_at);
                    const daysDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 3600 * 24);
                    const recencyScore = daysDiff <= 7 ? 50 : (daysDiff <= 30 ? 20 : 0);
                    const score = (tagStat.count * 1) + recencyScore;

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

                const topCandidates = scoredTags
                    .filter(item => item.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3);

                const resolvedOptions = await Promise.all(topCandidates.map(async (item) => {
                    let targetWeekday = item.maxWeekday;

                    try {
                        const recent = await ServiceEventApi.getRecentServicesWithFlows(teamId, item.tag.id, 5);
                        if (recent.length > 0) {
                            const dayCounts: Record<number, number> = {};
                            recent.forEach(s => {
                                const dateStr = typeof s.date === 'string' ? s.date : timestampToDateString(s.date);
                                const [y, m, d] = dateStr.split('-').map(Number);
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

                    const currentDay = now.getDay();
                    let daysUntil = targetWeekday - currentDay;

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
                    const exists = options.some(o => (o.id && o.id === h.id) || o.title === h.title);
                    if (!exists) {
                        options.push({ ...h, score: 0 });
                    }
                }
            }

            setShortcuts(options.sort((a, b) => a.date.getTime() - b.date.getTime()));
        };

        calculateSmartShortcuts();
    }, [teamId, serviceTags]);

    return (
        <div className="flex flex-wrap gap-2">
            {shortcuts.map((option) => {
                const isSelected = !!date && isSameDay(date, option.date) && tagId === option.id;

                return (
                    <button
                        key={option.title + option.date.toString()}
                        onClick={async (e) => {
                            e.currentTarget.blur();
                            onDateChange(option.date);
                            onMonthChange(option.date);

                            let resolvedTagId = option.id;

                            if (!resolvedTagId) {
                                resolvedTagId = await TeamApi.addServiceTag(teamId, option.title);
                                if (resolvedTagId) {
                                    setTagRefresh(prev => prev + 1);
                                }
                            }

                            if (resolvedTagId) {
                                onTagIdChange(resolvedTagId);
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
    );
}
