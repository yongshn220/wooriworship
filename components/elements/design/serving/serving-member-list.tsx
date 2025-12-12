import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ServingRole, ServingSchedule } from "@/models/serving";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    members: User[];
    currentUserUid?: string | null;
}

export function ServingMemberList({ schedule, roles, members, currentUserUid }: Props) {

    const getMember = (uid: string) => members.find(m => m.id === uid);

    if (schedule.roles.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No roles assigned.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schedule.roles
                .slice() // Create a copy to avoid mutating props
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
                                                <AvatarFallback className="text-[9px]">{member?.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{member?.name || "Unknown"}</span>
                                        </div>
                                    );
                                })}
                                {assignment.memberIds.length === 0 && (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                            </div>
                        </div>
                    )
                })}
        </div>
    );
}
