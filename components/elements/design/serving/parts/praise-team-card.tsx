"use client";

import { ServingRole, ServingAssignment } from "@/models/serving";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";
import { getMemberName } from "@/components/util/helper/helper-functions";

interface Props {
    praiseAssignments: ServingAssignment[];
    roles: ServingRole[];
    members: User[];
    currentUserUid?: string | null;
    onEdit?: () => void;
}

export function PraiseTeamCard({ praiseAssignments, roles, members, currentUserUid, onEdit }: Props) {
    if (!praiseAssignments || praiseAssignments.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-md">
                        <Music size={18} />
                    </div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white">Praise Team</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                        {praiseAssignments.length} roles
                    </span>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-[11px] font-bold text-slate-400 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-panel dark:bg-panel-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                <div className="divide-y divide-border-light dark:divide-border-dark">
                    {praiseAssignments.map((assign, index) => {
                        const role = roles.find(r => r.id === assign.roleId);
                        if (!role) return null;

                        return (
                            <div key={assign.roleId} className="grid grid-cols-[2.5rem_1fr_1.1fr] gap-3 px-3 py-3 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <div className="text-slate-400 dark:text-slate-600 font-mono text-xs font-medium">
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">
                                    {role.name}
                                </div>
                                <div className="text-right flex flex-col space-y-1.5 items-end w-full">
                                    {assign.memberIds.map(uid => (
                                        <span key={uid} className={cn(
                                            "inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-sm whitespace-nowrap",
                                            currentUserUid === uid
                                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                        )}>
                                            {getMemberName(uid, members)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
