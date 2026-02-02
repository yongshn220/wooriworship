"use client";

import { ServiceRole, ServiceAssignment } from "@/models/services/ServiceEvent";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { getMemberName } from "@/components/util/helper/helper-functions";
import { SectionHeader, SectionCardContainer } from "@/components/common/section-card";

interface Props {
    praiseAssignments: ServiceAssignment[];
    roles: ServiceRole[];
    members: User[];
    currentUserUid?: string | null;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function PraiseTeamCard({ praiseAssignments, roles, members, currentUserUid, onEdit, onDelete }: Props) {
    if (!praiseAssignments || praiseAssignments.length === 0) return null;

    return (
        <div data-testid="praise-team-card">
            <SectionCardContainer>
                <SectionHeader
                    icon={Users}
                    iconColorClassName="bg-blue-500/10 text-blue-500"
                    title="Praise Team"
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                <div className="divide-y divide-border">
                    {praiseAssignments.map((assign, index) => {
                        const role = roles.find(r => r.id === assign.roleId);
                        if (!role) return null;

                        return (
                            <div key={assign.roleId} className="grid grid-cols-[2.5rem_1fr_1.1fr] gap-3 px-3 py-3 items-center hover:bg-muted/50 transition-colors">
                                <div className="text-muted-foreground font-mono text-xs font-medium">
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="font-semibold text-sm text-foreground leading-tight">
                                    {role.name}
                                </div>
                                <div className="text-right flex flex-col space-y-1.5 items-end w-full">
                                    {assign.memberIds.map(uid => (
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
                        );
                    })}
                </div>
            </SectionCardContainer>
        </div>
    );
}
