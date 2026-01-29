"use client";

import { ServiceFlowItem } from "@/models/services/ServiceEvent";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { getMemberName } from "@/components/util/helper/helper-functions";
import { SectionHeader, SectionCardContainer } from "@/components/common/section-card";

interface Props {
    items: ServiceFlowItem[];
    members: User[];
    currentUserUid?: string | null;
    onEdit?: () => void;
}

export function ServiceOrderCard({ items, members, currentUserUid, onEdit }: Props) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-2">
            <SectionHeader
                icon={List}
                iconColorClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                title="Service Order"
                badge={`${items.length} items`}
                onEdit={onEdit}
            />

            <SectionCardContainer>
                <div className="divide-y divide-border">
                    {items.slice().sort((a, b) => a.order - b.order).map((item, index) => (
                        <div key={item.id} className="grid grid-cols-[2.5rem_1fr_1.1fr] gap-3 px-3 py-3 items-start hover:bg-muted/50 transition-colors">
                            <div className="text-muted-foreground font-mono text-xs font-medium mt-1">
                                {(index + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-foreground">
                                    {item.title}
                                </span>
                                {item.remarks && (
                                    <div className="flex items-center mt-1 text-[10px] text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 shadow-[0_0_4px_rgba(250,204,21,0.5)]"></span>
                                        {item.remarks}
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex flex-col space-y-1.5 items-end w-full">
                                {item.assignments.flatMap(a => a.memberIds).map(uid => (
                                    <span key={uid} className={cn(
                                        "inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-sm whitespace-nowrap",
                                        currentUserUid === uid
                                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                            : "bg-card border-border text-muted-foreground"
                                    )}>
                                        {getMemberName(uid, members)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCardContainer>
        </div>
    );
}
