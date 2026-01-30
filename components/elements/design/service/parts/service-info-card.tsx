"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, differenceInCalendarDays } from "date-fns";
import { useRouter } from "next/navigation";
import { getPathSetlistView } from "@/components/util/helper/routes";
import { Timestamp } from "@firebase/firestore";
import { parseLocalDate } from "@/components/util/helper/helper-functions";
import { ServiceHeaderMenu } from "../service-header-menu";
import { MyAssignmentRole } from "@/models/services/MyAssignment";
import { cn } from "@/lib/utils";

interface Props {
    scheduleId: string;
    title: string;
    date: Date | Timestamp | string;
    setlistId?: string;
    teamId: string;
    onPreview?: (setlistId: string) => void;
    myRoles?: MyAssignmentRole[];
}

export function ServiceInfoCard({ scheduleId, title, date, setlistId, teamId, onPreview, myRoles }: Props) {
    const router = useRouter();

    const dateObj = date instanceof Timestamp ? date.toDate() : (date instanceof Date ? date : parseLocalDate(date));
    const dateStr = format(dateObj, "yyyy. MM. dd (EEE)");

    const diffDays = differenceInCalendarDays(dateObj, new Date());
    const dDayLabel = diffDays === 0 ? "Today" : diffDays > 0 ? `D-${diffDays}` : null;

    const getRoleLabel = (role: MyAssignmentRole) => {
        if (role.source === 'flow') return role.flowItemTitle || role.roleName;
        return role.roleName;
    };

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm bg-card border border-border/40 border-l-[3px] border-l-primary" data-testid="service-info-card">
            {/* Service tag + menu */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <h1 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                    {title}
                </h1>
                <ServiceHeaderMenu
                    scheduleId={scheduleId}
                    teamId={teamId}
                    iconType="horizontal"
                    scheduleTitle={title}
                    scheduleDate={format(dateObj, "yyyy/MM/dd")}
                    trigger={
                        <button className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted active:scale-95">
                            Edit
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    }
                />
            </div>

            {/* Date row */}
            <div className="px-5 pb-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                    {dateStr}
                </span>
                {dDayLabel && (
                    <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        diffDays === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                    )}>
                        {dDayLabel}
                    </span>
                )}
            </div>

            {/* Roles + actions */}
            {(myRoles && myRoles.length > 0) || setlistId ? (
                <>
                    <div className="mx-5 border-t border-border/30" />
                    <div className="px-5 py-3 flex items-center justify-between gap-2">
                        {/* My Roles */}
                        {myRoles && myRoles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 flex-1">
                                {myRoles.map((role, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary dark:bg-primary/20"
                                    >
                                        {getRoleLabel(role)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div />
                        )}

                        {/* Setlist view button */}
                        {setlistId && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    if (onPreview) {
                                        onPreview(setlistId);
                                    } else {
                                        router.push(getPathSetlistView(teamId, setlistId));
                                    }
                                }}
                                className="text-primary hover:bg-primary/5 font-semibold h-9 rounded-lg px-3 transition-all active:scale-95 flex items-center gap-1.5 text-sm shrink-0"
                            >
                                Setlist
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}
