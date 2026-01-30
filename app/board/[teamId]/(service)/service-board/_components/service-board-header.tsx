"use client";

import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

interface ServiceBoardHeaderLeftProps {
    filterMode: 'all' | 'mine' | 'calendar';
    onFilterModeChange: (mode: 'all' | 'mine' | 'calendar') => void;
    myCount: number;
}

export function ServiceBoardHeaderLeft({
    filterMode,
    onFilterModeChange,
    myCount,
}: ServiceBoardHeaderLeftProps) {
    const options: { key: 'all' | 'mine' | 'calendar'; label: React.ReactNode }[] = [
        { key: 'all', label: 'All' },
        {
            key: 'mine',
            label: (
                <span className="flex items-center gap-1">
                    Mine
                    {myCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                            {myCount}
                        </span>
                    )}
                </span>
            ),
        },
        {
            key: 'calendar',
            label: (
                <span className="flex items-center gap-0.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Cal
                </span>
            ),
        },
    ];

    return (
        <div className="flex bg-muted/60 rounded-lg p-0.5">
            {options.map((opt) => (
                <button
                    key={opt.key}
                    onClick={() => onFilterModeChange(opt.key)}
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
