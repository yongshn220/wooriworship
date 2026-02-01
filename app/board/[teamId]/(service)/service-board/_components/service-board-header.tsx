"use client";

import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { serviceFilterModeAtom, myAssignmentCountAtom } from "@/global-states/serviceEventState";

export function ServiceBoardHeaderLeft() {
    const [filterMode, setFilterMode] = useRecoilState(serviceFilterModeAtom);
    const myCount = useRecoilValue(myAssignmentCountAtom);

    const options: { key: 'all' | 'mine' | 'calendar'; label: React.ReactNode }[] = [
        { key: 'all', label: 'All' },
        {
            key: 'mine',
            label: (
                <span className="flex items-center gap-1">
                    Mine
                    <span
                        className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none transition-opacity",
                            myCount > 0
                                ? "bg-primary text-primary-foreground opacity-100"
                                : "opacity-0"
                        )}
                        aria-label={myCount > 0 ? `${myCount} upcoming assignments` : undefined}
                    >
                        {myCount || 0}
                    </span>
                </span>
            ),
        },
        {
            key: 'calendar',
            label: (
                <span className="flex items-center gap-0.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Calendar
                </span>
            ),
        },
    ];

    return (
        <div className="flex bg-muted/60 rounded-lg p-0.5" role="tablist" aria-label="Service filter">
            {options.map((opt) => (
                <button
                    key={opt.key}
                    role="tab"
                    aria-selected={filterMode === opt.key}
                    onClick={() => setFilterMode(opt.key)}
                    className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all",
                        filterMode === opt.key
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
