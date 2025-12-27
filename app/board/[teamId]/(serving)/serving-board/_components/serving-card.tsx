"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// Default expanded to true as requested
export function ServingCard({ schedule, teamId, currentUserUid, defaultExpanded = true }: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));

    // Gather all member IDs involved in this schedule for batch fetching
    const allMemberIds = schedule.items
        ? schedule.items.flatMap(item => item.assignments.flatMap(a => a.memberIds))
        : (schedule.roles?.flatMap(r => r.memberIds) || []);

    const members = useRecoilValue(usersAtom(allMemberIds));

    // Data Helpers
    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || "Unknown Role";
    const getMember = (uid: string) => members.find(m => m.id === uid);

    // Check if current user is serving in this schedule
    const isMeServing = currentUserUid ? (
        schedule.items
            ? schedule.items.some(item => item.assignments.some(a => a.memberIds.includes(currentUserUid)))
            : (schedule.roles?.some(r => r.memberIds.includes(currentUserUid)) || false)
    ) : false;

    // Date Logic
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
                "overflow-hidden transition-all duration-300 border shadow-sm hover:shadow-md cursor-pointer bg-card",
                isExpanded ? "ring-2 ring-primary" : ""
            )}
            onClick={handleCardClick}
        >
            <CardContent className="p-4 sm:p-6">
                {/* Header */}
                {/* Header */}
                <div className="group cursor-pointer" onClick={handleHeaderClick}>
                    {/* Collapsed Header */}
                    {!isExpanded && (
                        <div className="flex justify-between items-start mb-4">
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
                                    <ChevronDown className="h-5 w-5 text-muted-foreground animate-in fade-in zoom-in" />
                                </h3>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <ServingHeaderMenu scheduleId={schedule.id} teamId={teamId} />
                            </div>
                        </div>
                    )}

                    {/* Expanded Header (Final Review Style) */}
                    {isExpanded && (
                        <div className="relative">
                            <div className="absolute right-0 top-0" onClick={(e) => e.stopPropagation()}>
                                <ServingHeaderMenu scheduleId={schedule.id} teamId={teamId} />
                            </div>
                            <div className="absolute left-0 top-0">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleExpand(); }} className="h-8 w-8 -ml-2 text-muted-foreground">
                                    <ChevronUp className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex flex-col items-center justify-center py-4 border-b border-border/10 mb-0 mx-auto">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
                                        {format(scheduleDate, "MMM d")}
                                    </h2>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide opacity-70">
                                        {format(scheduleDate, "EEEE, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
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
                            <ServingMemberList
                                schedule={schedule}
                                roles={roles}
                                members={members}
                                currentUserUid={currentUserUid}
                                filterMine={true}
                            />
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                                {schedule.items ? `${schedule.items.length} items` : `${schedule.roles?.length || 0} roles`}
                                , {allMemberIds.length} members assigned
                            </p>
                        )}
                    </motion.div>
                )}

            </CardContent>
        </Card >
    );
}
