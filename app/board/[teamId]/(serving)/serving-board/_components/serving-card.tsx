"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ServingSchedule } from "@/models/serving";
import { fetchServingRolesSelector } from "@/global-states/servingState";
import { usersAtom } from "@/global-states/userState";
import { auth } from "@/firebase";
import { getDayPassedFromTimestampShorten } from "@/components/util/helper/helper-functions";
import { ServingHeaderMenu } from "./serving-header-menu";
import { ServingMemberList } from "@/components/elements/design/serving/serving-member-list";

interface Props {
    schedule: ServingSchedule;
    teamId: string;
    currentUserUid?: string;
    defaultExpanded?: boolean;
}

export function ServingCard({ schedule, teamId, currentUserUid, defaultExpanded = false }: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));

    // Gather all member IDs involved in this schedule for batch fetching
    const allMemberIds = schedule.roles.flatMap(r => r.memberIds);
    const members = useRecoilValue(usersAtom(allMemberIds));

    // Data Helpers
    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || "Unknown Role";
    const getMember = (uid: string) => members.find(m => m.id === uid);

    // Check if current user is serving in this schedule
    const isMeServing = currentUserUid ? schedule.roles.some(r => r.memberIds.includes(currentUserUid)) : false;

    // Date Logic
    // Parse manually to ensure local time is used (YYYY-MM-DD -> local midnight)
    // new Date("YYYY-MM-DD") treats it as UTC, which causes shift in western timezones
    const [year, month, day] = schedule.date.split("-").map(Number);
    const scheduleDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = scheduleDate < today;

    // Toggle Handler
    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleHeaderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleExpand();
    };

    const handleCardClick = () => {
        if (!isExpanded) {
            toggleExpand();
        }
    };

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-md cursor-pointer",
                isExpanded ? "ring-2 ring-primary bg-card" : (isPast ? "bg-muted/30" : "bg-card")
            )}
            onClick={handleCardClick}
        >
            <CardContent className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 group cursor-pointer" onClick={handleHeaderClick}>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full",
                                isPast ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary font-bold"
                            )}>
                                {getDayPassedFromTimestampShorten({ seconds: scheduleDate.getTime() / 1000, nanoseconds: 0 } as any)}
                            </span>

                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                            {format(scheduleDate, "yyyy. MM. dd (EEE)")}
                            {isExpanded ?
                                <ChevronUp className="h-5 w-5 text-muted-foreground animate-in fade-in zoom-in" /> :
                                <ChevronDown className="h-5 w-5 text-muted-foreground animate-in fade-in zoom-in" />
                            }
                        </h3>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                        <ServingHeaderMenu scheduleId={schedule.id} teamId={teamId} />
                    </div>
                </div>

                {/* Body */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border space-y-4"
                        >
                            <ServingMemberList
                                schedule={schedule}
                                roles={roles}
                                members={members}
                                currentUserUid={currentUserUid}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsed Content */}
                {!isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 pt-4 border-t border-border space-y-4"
                    >
                        {isMeServing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {schedule.roles
                                    .filter(r => r.memberIds.includes(currentUserUid!))
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
                                                    {/* Show ONLY Me in collapsed view per user request? Or all members in that role? 
                                                         "만약 내가 있다면 hide 하지말고 표시되게 하라는거야 (같은 ui가)" 
                                                         Usually implies seeing the context of that role. 
                                                         But strictly "hide everything else" might mean only show ME.
                                                         However, purely showing ME chip might look odd if others are in the same role.
                                                         The screenshot shows "Yongjung Shin" in a chip.
                                                         I'll show ONLY the user chip to be safe and strictly follow "hide others".
                                                     */}
                                                    <div
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-sm transition-colors",
                                                            "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                                                        )}
                                                    >
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarFallback className="text-[9px]">{getMember(currentUserUid!)?.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{getMember(currentUserUid!)?.name || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                                {schedule.roles.length} roles, {allMemberIds.length} members assigned
                            </p>
                        )}
                    </motion.div>
                )}

            </CardContent>
        </Card >
    );
}

