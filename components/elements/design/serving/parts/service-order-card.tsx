"use client";

import { ServingItem } from "@/models/serving";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { getMemberName } from "@/components/util/helper/helper-functions";

interface Props {
    items: ServingItem[];
    members: User[];
    currentUserUid?: string | null;
}

export function ServiceOrderCard({ items, members, currentUserUid }: Props) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-1 rounded-md">
                        <List size={18} />
                    </div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white">Service Order</h2>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {items.length} items
                </span>
            </div>

            <div className="bg-panel dark:bg-panel-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                <div className="divide-y divide-border-light dark:divide-border-dark">
                    {items.slice().sort((a, b) => a.order - b.order).map((item, index) => (
                        <div key={item.id} className="grid grid-cols-[2.5rem_1fr_1.1fr] gap-3 px-3 py-3 items-start hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div className="text-slate-400 dark:text-slate-600 font-mono text-xs font-medium mt-1">
                                {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                    {item.title}
                                </span>
                                {item.remarks && (
                                    <div className="flex items-center mt-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-1.5 py-0.5 rounded">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 shadow-[0_0_4px_rgba(250,204,21,0.5)]"></span>
                                        {item.remarks}
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex flex-col space-y-1.5 items-end w-full">
                                {item.assignments.flatMap(a => a.memberIds).map(uid => (
                                    <span key={uid} className={cn(
                                        "inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-[11px] font-medium shadow-sm whitespace-nowrap",
                                        currentUserUid === uid
                                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold"
                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                    )}>
                                        {getMemberName(uid, members)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
