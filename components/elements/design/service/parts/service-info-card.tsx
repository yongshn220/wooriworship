"use client";

import { ArrowRight } from "lucide-react";
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
    tagId?: string;
    onEdited?: () => void;
}

export function ServiceInfoCard({ scheduleId, title, date, setlistId, teamId, onPreview, myRoles, tagId, onEdited }: Props) {
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
                    scheduleTitle={title}
                    scheduleDate={format(dateObj, "yyyy/MM/dd")}
                    tagId={tagId}
                    eventDate={dateObj}
                    onEdited={onEdited}
                />
            </div>

            {/* Date row */}
            <div className="px-5 pb-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                    {dateStr}
                </span>
                {dDayLabel && (
                    <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                        diffDays === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-orange-100 text-red-500 dark:bg-orange-500/20 dark:text-red-400"
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
                            <div className="flex flex-wrap items-center gap-1.5 flex-1">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-0.5">
                                    My Roles
                                </span>
                                {myRoles.map((role, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
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
