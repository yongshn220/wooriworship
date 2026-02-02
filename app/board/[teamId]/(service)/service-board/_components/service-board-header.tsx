"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { serviceFilterModeAtom, myAssignmentCountAtom } from "@/global-states/serviceEventState";

export function ServiceBoardHeaderLeft() {
    const [filterMode, setFilterMode] = useRecoilState(serviceFilterModeAtom);
    const myCount = useRecoilValue(myAssignmentCountAtom);

    const tabs: { key: 'all' | 'mine' | 'calendar'; label: React.ReactNode }[] = [
        { key: 'all', label: 'All' },
        {
            key: 'mine',
            label: (
                <span className="relative">
                    Mine
                    {myCount > 0 && (
                        <span className="absolute -top-1 -right-2.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </span>
            ),
        },
        {
            key: 'calendar',
            label: (
                <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
                    Calendar
                </span>
            ),
        },
    ];

    return (
        <div className="flex bg-muted rounded-full p-1 gap-0.5" role="tablist" aria-label="Service filter">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    role="tab"
                    aria-selected={filterMode === tab.key}
                    onClick={() => setFilterMode(tab.key)}
                    className={cn(
                        "relative px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center",
                        filterMode === tab.key
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
