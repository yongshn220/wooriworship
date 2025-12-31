"use client";

import React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { AssignmentControl, ServingCard } from "../serving-components";

interface SortableRoleItemProps {
    role: any;
    memberIds: string[];
    teamMembers: any[];
    onAddMember: (roleId: string, uid: string) => void;
    onDeleteRole: () => void;
    onOpenAdd: () => void;
}

export function SortableRoleItem({ role, memberIds, teamMembers, onAddMember, onDeleteRole, onOpenAdd }: SortableRoleItemProps) {
    const controls = useDragControls();
    const isAssigned = memberIds.length > 0;

    // Get suggested members who are NOT yet assigned
    const suggestions = (role.default_members && role.default_members.length > 0
        ? teamMembers.filter(m => role.default_members?.includes(m.id) && !memberIds.includes(m.id))
        : []);

    return (
        <Reorder.Item value={role} dragListener={false} dragControls={controls} className="select-none relative">
            <ServingCard className="p-0 gap-0 overflow-hidden border-none shadow-sm rounded-xl bg-white relative group transition-transform duration-200">
                {/* Drag Handle - Top Left */}
                <div
                    className="absolute left-3 top-5 p-2 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 hover:bg-gray-50 rounded-lg transition-colors touch-none"
                    onPointerDown={(e) => controls.start(e)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="text-gray-300 w-5 h-5" />
                </div>

                {/* Delete Button - Absolute Top Right */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-5 p-2 h-auto w-auto text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRole();
                    }}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>

                {/* Main Content - Top (Role Name) */}
                <div className="pl-12 pr-12 pt-6 pb-3">
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
        </Reorder.Item>
    );
}
