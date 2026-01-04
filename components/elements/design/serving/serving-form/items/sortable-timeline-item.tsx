"use client";

import React from "react";
import { SortableItem, SortableDragHandle } from "@/components/common/list/sortable-list";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Pencil } from "lucide-react";
import { AssignmentControl, ServingCard } from "../serving-components";

interface SortableTimelineItemProps {
    item: any;
    getMemberName: (id: string) => string;
    onUpdate: (newItem: any) => void;
    onDelete: () => void;
    onOpenAdd: (assignmentIndex: number) => void;
    onRemoveMember: (assignmentIndex: number, uid: string) => void;
    suggestions: { id: string; name: string }[];
}

export function SortableTimelineItem({ item, getMemberName, onUpdate, onDelete, onOpenAdd, onRemoveMember, suggestions }: SortableTimelineItemProps) {
    const assignment = item.assignments[0] || { memberIds: [] };
    const memberCount = assignment.memberIds.length;
    const isAssigned = memberCount > 0;

    return (
        <SortableItem value={item} className="select-none.relative">
            {(controls) => (
                <ServingCard
                    className="p-0 gap-0 overflow-hidden border-none shadow-sm rounded-xl bg-white relative group transition-transform duration-200"
                    dragHandle={<SortableDragHandle controls={controls} />}
                    onRemove={onDelete}
                >
                    {/* Main Content - Top (Title/Remarks) */}
                    <div className="pl-16 pr-16 pt-6 pb-3">
                        <div className="flex flex-col gap-1.5">
                            {/* Title Input */}
                            <div className="flex items-center gap-2 group/edit w-full">
                                <Pencil className="w-3.5 h-3.5 text-blue-500/30 flex-shrink-0" />
                                <input
                                    value={item.title}
                                    onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[18px] font-bold text-gray-900 bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-300 w-full leading-tight"
                                    placeholder="Sequence Title"
                                />
                            </div>
                            {/* Remarks Input */}
                            <div className="flex items-center gap-2 group/edit w-full">
                                <Pencil className="w-3 h-3 text-blue-500/30 flex-shrink-0" />
                                <input
                                    value={item.remarks || ""}
                                    onChange={(e) => onUpdate({ ...item, remarks: e.target.value })}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[14px] text-gray-400 font-medium bg-transparent border-0 focus:ring-0 p-0 placeholder:text-gray-300 w-full"
                                    placeholder="Add note..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100/60 mx-5" />

                    {/* Bottom Row - Assignments (Full Width Padding) */}
                    <div
                        className="px-5 pt-2 pb-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:bg-gray-100/70 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenAdd(0);
                        }}
                    >
                        <div className="w-full">
                            <AssignmentControl
                                assignedMembers={assignment.memberIds.map((uid: string) => {
                                    const name = getMemberName(uid);
                                    return { id: uid, name: name.replace(/^group:/, '') };
                                })}
                                suggestions={suggestions.filter(s => !assignment.memberIds.includes(s.id))}
                                onAddMember={(id) => onRemoveMember(0, id)}
                                onRemoveMember={(id) => onRemoveMember(0, id)}
                                onOpenAdd={() => onOpenAdd(0)}
                                placeholder="Assign Member"
                            />
                        </div>
                    </div>
                </ServingCard>
            )}
        </SortableItem>
    );
}
