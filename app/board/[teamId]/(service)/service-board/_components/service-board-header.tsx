"use client";

import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceBoardHeaderLeftProps {
    filterMode: 'all' | 'mine';
    onFilterModeChange: (mode: 'all' | 'mine') => void;
    myCount: number;
    monthLabel: string;
}

export function ServiceBoardHeaderLeft({
    filterMode,
    onFilterModeChange,
    myCount,
    monthLabel,
}: ServiceBoardHeaderLeftProps) {
    return (
        <div className="flex items-center gap-3">
            {/* Compact segmented toggle */}
            <div className="flex bg-muted/50 rounded-lg p-0.5">
                <button
                    onClick={() => onFilterModeChange('all')}
                    className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all",
                        filterMode === 'all'
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    All
                </button>
                <button
                    onClick={() => onFilterModeChange('mine')}
                    className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all flex items-center gap-1",
                        filterMode === 'mine'
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Mine
                    {myCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {myCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Month label */}
            <span className="text-sm font-semibold text-muted-foreground truncate">
                {monthLabel}
            </span>
        </div>
    );
}

interface ServiceBoardHeaderRightProps {
    onCalendarOpen: () => void;
}

export function ServiceBoardHeaderRight({ onCalendarOpen }: ServiceBoardHeaderRightProps) {
    return (
        <motion.button
            onClick={onCalendarOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
            <Calendar className="w-5 h-5" />
        </motion.button>
    );
}
