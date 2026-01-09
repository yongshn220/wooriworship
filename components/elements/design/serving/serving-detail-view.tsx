"use client";

import { ServingRole, ServingSchedule } from "@/models/serving";
import { User } from "@/models/user";
import { cn } from "@/lib/utils";
import { Music, List, Calendar, ArrowRight } from "lucide-react";
import { teamAtom } from "@/global-states/teamState";
import { useRecoilValue } from "recoil";
import { getDynamicDisplayTitle, parseLocalDate, timestampToDateString } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { getPathWorshipView } from "@/components/util/helper/routes";
import { Button } from "@/components/ui/button";

interface Props {
    schedule: ServingSchedule;
    roles: ServingRole[];
    members: User[];
    currentUserUid?: string | null;
    teamId: string;
}

export function ServingDetailView({ schedule, roles, members, currentUserUid, teamId }: Props) {
    const team = useRecoilValue(teamAtom(teamId));
    const router = useRouter();

    const getMemberName = (uid: string) => {
        if (uid.startsWith("group:")) {
            return uid.replace(/^group:/, "");
        }
        const member = members.find(m => m.id === uid);
        return member?.name || uid;
    };

    const hasWorshipRoles = schedule.worship_roles && schedule.worship_roles.length > 0;
    const hasItems = schedule.items && schedule.items.length > 0;

    // Info Card Data
    const displayTitle = getDynamicDisplayTitle(schedule.service_tags, team?.service_tags, schedule.title);
    const dateObj = schedule.date instanceof Timestamp ? schedule.date.toDate() : parseLocalDate(schedule.date);
    const dateStr = format(dateObj, "yyyy M d (EEE)");

    return (
        <div className="space-y-5 pb-24">
            {/* Info Card */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex flex-col gap-3 relative z-10">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                            {displayTitle}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{dateStr}</span>
                        </div>
                    </div>

                    {schedule.worship_id && (
                        <div className="flex justify-end mt-2">
                            <Button
                                variant="ghost"
                                onClick={() => router.push(getPathWorshipView(teamId, schedule.worship_id!))}
                                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-sm font-semibold h-9 rounded-xl px-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-95 flex items-center gap-1"
                            >
                                worship plan
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Worship Team Section */}
            {hasWorshipRoles && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-md">
                                <Music size={18} />
                            </div>
                            <h2 className="font-bold text-base text-slate-900 dark:text-white">Worship Team</h2>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            {schedule.worship_roles?.length || 0} roles
                        </span>
                    </div>

                    <div className="bg-panel dark:bg-panel-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {schedule.worship_roles?.map((assign, index) => {
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
                                                    {getMemberName(uid)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Service Order Section */}
            {hasItems && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-2">
                            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-1 rounded-md">
                                <List size={18} />
                            </div>
                            <h2 className="font-bold text-base text-slate-900 dark:text-white">Service Order</h2>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            {schedule.items?.length || 0} items
                        </span>
                    </div>

                    <div className="bg-panel dark:bg-panel-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {schedule.items?.slice().sort((a, b) => a.order - b.order).map((item, index) => (
                                <div key={item.id} className="grid grid-cols-[2.5rem_1fr_1.1fr] gap-3 px-3 py-3 items-start hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="text-slate-400 dark:text-slate-600 font-mono text-xs font-medium mt-1">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                            {item.title}
                                        </span>
                                        {item.remarks && (
                                            <div className="flex items-center mt-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-1.5 py-0.5 rounded">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 shadow-[0_0_4px_rgba(250,204,21,0.5)]"></span>
                                                {item.remarks}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right flex flex-col space-y-1.5 items-end w-full">
                                        {item.assignments.flatMap(a => a.memberIds).map(uid => (
                                            <span key={uid} className={cn(
                                                "inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-[11px] font-medium shadow-sm whitespace-nowrap",
                                                currentUserUid === uid
                                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold"
                                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                            )}>
                                                {getMemberName(uid)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State / Fallback */}
            {!hasWorshipRoles && !hasItems && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-50">
                    <p className="text-sm text-slate-500">No details available for this schedule.</p>
                </div>
            )}
        </div>
    );
}
