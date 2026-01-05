import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MemberBadge, WorshipTeamRoleRow } from "./serving-form/serving-components";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    members: User[];
    currentUserUid?: string | null;
    filterMine?: boolean;
}

export function ServingMemberList({ schedule, roles, members, currentUserUid, filterMine = false }: Props) {
    const getMemberName = (uid: string) => {
        const member = members.find(m => m.id === uid);
        return member?.name || uid;
    };
    const getMember = (uid: string) => members.find(m => m.id === uid);

    // 1. New Timeline View (If items exist)
    if (schedule.items && schedule.items.length > 0) {
        return (
            <div className="flex flex-col w-full">
                {schedule.items.slice().sort((a, b) => a.order - b.order).map((item, index) => {
                    // Filter logic: If filtering is on, check if user is assigned
                    const isAssigned = item.assignments.some(a => a.memberIds.includes(currentUserUid || ""));
                    if (filterMine && !isAssigned) return null;

                    return (
                        <div key={item.id} className="group flex gap-4 py-1.5 border-b border-border/40 last:border-0 relative text-left">
                            {/* Left: Index / Time Marker */}
                            <div className="flex-shrink-0 w-12 pt-1 flex flex-col items-center gap-1">
                                <span className="text-sm font-bold text-gray-400 font-mono tracking-tighter">
                                    {((item.order ?? index) + 1).toString().padStart(2, '0')}
                                </span>
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                {/* Header Row: Title & Who */}
                                <div className="flex flex-row justify-between items-start gap-4">
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                        <h3 className="text-base font-bold leading-tight break-keep text-foreground pt-1">
                                            {item.title || "Untitled Sequence"}
                                        </h3>

                                        {/* Notes / Remarks - Prominent Display */}
                                        {item.remarks && (
                                            <div className="relative pl-3">
                                                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-yellow-400/50 rounded-full" />
                                                <p className="text-sm text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {item.remarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Standard Assignments (Right Aligned) - EXCEPT for Worship Team */}
                                    {item.type !== 'WORSHIP_TEAM' && item.assignments && (
                                        <div className="flex flex-col items-end gap-1.5 min-w-[40%]">
                                            {item.assignments.flatMap(a =>
                                                a.memberIds.map(uid => (
                                                    <MemberBadge
                                                        key={`${a.roleId}-${uid}`}
                                                        name={getMemberName(uid)}
                                                        className="bg-secondary/40 border-transparent"
                                                        isMe={currentUserUid === uid}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Full Width Assignments for Worship Team (Indented Below) */}
                                {item.type === 'WORSHIP_TEAM' && item.assignments && (
                                    <div className="w-full flex flex-col gap-3 mt-3 pl-1">
                                        {item.assignments.map(assign => {
                                            if (assign.memberIds.length === 0) return null;

                                            // WORKSHOP_TEAM Filter: If filtered, only show roles containing me
                                            if (filterMine && !assign.memberIds.includes(currentUserUid || "")) return null;

                                            const role = roles.find(r => r.id === assign.roleId);
                                            // Hide orphaned assignments (role deleted but assignment remains)
                                            if (!role) return null;

                                            return (
                                                <WorshipTeamRoleRow
                                                    key={assign.roleId}
                                                    roleName={role.name}
                                                    memberIds={assign.memberIds}
                                                    getMemberName={getMemberName}
                                                    className="py-1 border-b border-border/30 last:border-0"
                                                    currentUserUid={currentUserUid}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    }

    // 2. Legacy Grid View (Fallback)
    if (!schedule.roles || schedule.roles.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No roles assigned.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schedule.roles
                .slice()
                .sort((a, b) => {
                    const indexA = roles.findIndex(r => r.id === a.roleId);
                    const indexB = roles.findIndex(r => r.id === b.roleId);
                    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                })
                .map((assignment, idx) => {
                    const role = roles.find(r => r.id === assignment.roleId);
                    if (!role) return null;

                    return (
                        <div key={idx} className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {role.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {assignment.memberIds.map(uid => {
                                    const member = getMember(uid);
                                    const isMe = uid === currentUserUid;
                                    const displayName = member?.name || uid;

                                    return (
                                        <div
                                            key={uid}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2 py-1 rounded-full border text-sm transition-colors",
                                                isMe
                                                    ? "bg-primary/10 border-primary/20 text-primary font-medium"
                                                    : "bg-background border-border text-muted-foreground"
                                            )}
                                        >
                                            <Avatar className={cn("h-5 w-5", isMe ? "" : "grayscale opacity-70")}>
                                                <AvatarFallback className={cn("text-[9px]", isMe ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>{displayName[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{displayName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
        </div>
    );
}
