"use client";

import React from "react";
import { SortableItem, SortableDragHandle } from "@/components/common/list/sortable-list";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorshipTeamRoleRow, ServingCard } from "../service-components";
import { ServiceFlowItem } from "@/models/services/ServiceEvent";

interface SortableWorshipItemProps {
    item: ServiceFlowItem;
    getMemberName: (id: string) => string;
    onGoToStep2: () => void;
    onUpdate: (newItem: ServiceFlowItem) => void;
    roles: any[]; // Using any to avoid strict type issues if ServingRole isn't imported, but assuming roles structure
}

export function SortableWorshipItem({ item, getMemberName, onGoToStep2, onUpdate, roles }: SortableWorshipItemProps) {
    // Determine active roles (those with assigned members)
    const activeRoles = roles.filter(role => {
        const assignment = item.assignments.find(a => a.roleId === role.id);
        return assignment && assignment.memberIds.length > 0;
    });

    const MAX_DISPLAY = 6;
    const hasMore = activeRoles.length > MAX_DISPLAY;
    const displayRoles = hasMore ? activeRoles.slice(0, MAX_DISPLAY) : activeRoles;
    const remainingCount = activeRoles.length - MAX_DISPLAY;

    return (
        <SortableItem value={item} className="z-0 select-none relative">
            {(controls) => (
                <ServingCard
                    className="group gap-4 bg-gradient-to-br from-blue-50/50 to-white shadow-sm hover:shadow-md transition-all"
                    dragHandle={<SortableDragHandle controls={controls} className="mt-1" />}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 pl-12">
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50 whitespace-nowrap">
                                    Fixed Item
                                </Badge>
                                <div className="flex items-center gap-2 group/edit w-full">
                                    <Pencil className="w-3.5 h-3.5 text-blue-500/30 flex-shrink-0" />
                                    <input
                                        value={item.title}
                                        onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-lg font-bold text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-300 w-full leading-tight"
                                        placeholder="Title"
                                    />
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onGoToStep2} className="text-xs text-primary hover:bg-primary/10 h-8 rounded-full whitespace-nowrap">
                            Edit
                        </Button>
                    </div>

                    {/* Content: Read-only list of assigned roles */}
                    <div className="pl-8 space-y-2">
                        {activeRoles.length > 0 ? (
                            <div className="flex flex-col gap-3 w-full">
                                {displayRoles.map(role => {
                                    const assignment = item.assignments.find(a => a.roleId === role.id);
                                    if (!assignment) return null;

                                    return (
                                        <WorshipTeamRoleRow
                                            key={role.id}
                                            roleName={role.name}
                                            memberIds={assignment.memberIds}
                                            getMemberName={getMemberName}
                                            className="border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                                        />
                                    );
                                })}

                                {hasMore && (
                                    <button
                                        onClick={onGoToStep2}
                                        className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:text-primary transition-colors mt-1"
                                    >
                                        View {remainingCount} more roles...
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground italic">No members assigned.</p>
                                <Button variant="link" size="sm" onClick={onGoToStep2} className="h-auto p-0 text-primary">
                                    Assign in Step 2
                                </Button>
                            </div>
                        )
                        }
                    </div>
                </ServingCard>
            )}
        </SortableItem>
    );
}
