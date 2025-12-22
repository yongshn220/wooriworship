import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ServingRole, ServingSchedule, ServingAssignment } from "@/models/serving";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    members: User[];
    currentUserUid?: string | null;
}

export function ServingMemberList({ schedule, roles, members, currentUserUid }: Props) {
    const getMember = (uid: string) => members.find(m => m.id === uid);

    // 1. New Timeline View (If items exist)
    if (schedule.items && schedule.items.length > 0) {
        return (
            <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted-foreground/10">
                {schedule.items.sort((a, b) => a.order - b.order).map((item, idx) => (
                    <div key={item.id} className="relative pl-10">
                        {/* Timeline Dot */}
                        <div className={cn(
                            "absolute left-0 top-1.5 w-9 h-9 rounded-full bg-background border-2 flex items-center justify-center font-bold text-xs shadow-sm z-10",
                            item.assignments.some(a => a.memberIds.includes(currentUserUid || ""))
                                ? "border-primary text-primary"
                                : "border-muted text-muted-foreground"
                        )}>
                            {idx + 1}
                        </div>

                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    {item.title}
                                    {item.type === 'SUPPORT' && <Badge variant="secondary" className="text-[9px] h-4 py-0 font-normal opacity-70">Support</Badge>}
                                </h4>
                                {item.remarks && <p className="text-xs text-muted-foreground italic">{item.remarks}</p>}
                            </div>

                            {/* Grouped Assignments (Praise Team style) */}
                            <div className="flex flex-wrap gap-2">
                                {item.assignments.map((assignment, aIdx) => (
                                    <div key={aIdx} className="flex items-center gap-1.5 flex-wrap">
                                        {(assignment.label || assignment.roleId) && (
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted/50 px-1.5 py-0.5 rounded">
                                                {assignment.label || roles.find(r => r.id === assignment.roleId)?.name}
                                            </span>
                                        )}
                                        {assignment.memberIds.map(uid => {
                                            const member = getMember(uid);
                                            const isMe = uid === currentUserUid;
                                            const displayName = member?.name || uid;

                                            return (
                                                <div
                                                    key={uid}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] transition-colors",
                                                        isMe
                                                            ? "bg-primary/10 border-primary/20 text-primary font-medium"
                                                            : "bg-muted/30 border-transparent text-foreground"
                                                    )}
                                                >
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarFallback className="text-[7px]">{displayName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{displayName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
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
                                                    : "bg-background border-border text-foreground"
                                            )}
                                        >
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[9px]">{displayName[0]}</AvatarFallback>
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
