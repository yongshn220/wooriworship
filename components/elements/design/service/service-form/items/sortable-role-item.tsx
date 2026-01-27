"use client";

import React from "react";
import { SortableItem, SortableDragHandle } from "@/components/common/list/sortable-list";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { AssignmentControl, ServingCard } from "../service-components";

interface SortableRoleItemProps {
    role: any;
    memberIds: string[];
    teamMembers: any[];
    onAddMember: (roleId: string, uid: string) => void;
    onDeleteRole: () => void;
    onOpenAdd: () => void;
}

export function SortableRoleItem({ role, memberIds, teamMembers, onAddMember, onDeleteRole, onOpenAdd }: SortableRoleItemProps) {
    const isAssigned = memberIds.length > 0;

    // Get suggested members who are NOT yet assigned
    const suggestions = (role.default_members && role.default_members.length > 0
        ? teamMembers.filter(m => role.default_members?.includes(m.id) && !memberIds.includes(m.id))
        : []);

    return (
        <SortableItem value={role} className="select-none relative">
            {(controls) => (
                <ServingCard
                    className="p-0 gap-0 overflow-hidden border-none shadow-sm rounded-xl bg-white relative group transition-transform duration-200"
                    dragHandle={<SortableDragHandle controls={controls} className="p-2" />}
                    onRemove={onDeleteRole}
                >
                    {/* Main Content - Top (Role Name) */}
                    <div className="pl-16 pr-12 pt-6 pb-3">
                        <h3 className="text-[18px] font-bold text-gray-900 leading-tight">{role.name}</h3>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100/60 mx-5" />

                    {/* Bottom Row - Assignments & Suggestions */}
                    <div
                        className="px-5 pt-2 pb-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100/70 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenAdd();
                        }}
                    >
                        <AssignmentControl
                            assignedMembers={memberIds.map(uid => ({ id: uid, name: teamMembers.find(m => m.id === uid)?.name || uid }))}
                            suggestions={suggestions}
                            onAddMember={(id) => onAddMember(role.id, id)}
                            onRemoveMember={(id) => onAddMember(role.id, id)}
                            onOpenAdd={onOpenAdd}
                            placeholder="Assign Member"
                        />
                    </div>
                </ServingCard>
            )}
        </SortableItem>
    );
}
