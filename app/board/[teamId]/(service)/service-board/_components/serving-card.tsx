"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, User, Eye, Link as LinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { BoardCard } from "@/components/common/board/board-card";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ServiceFormState } from "@/models/services/ServiceEvent";
import { fetchServingRolesSelector } from "@/global-states/serviceRolesState";
import { usersAtom } from "@/global-states/userState";
import { teamAtom } from "@/global-states/teamState";
import { auth } from "@/firebase";
import { getDayPassedFromTimestampShorten, getDynamicDisplayTitle, parseLocalDate } from "@/components/util/helper/helper-functions";
import { Timestamp } from "@firebase/firestore";
import { ServingHeaderMenu } from "@/components/elements/design/serving/serving-header-menu";
import { ServingMemberList } from "@/components/elements/design/serving/serving-member-list";

interface Props {
    schedule: ServiceFormState;
    teamId: string;
    currentUserUid?: string;
    defaultExpanded?: boolean;
    onPreviewWorship?: (worshipId: string) => void;
}

// Default expanded to true as requested
import { useCardExpansion } from "@/hooks/use-card-expansion";

// ...

export function ServingCard({ schedule, teamId, currentUserUid, defaultExpanded = true, onPreviewWorship }: Props) {
    const { isExpanded, setIsExpanded, toggleExpand } = useCardExpansion(schedule.id, defaultExpanded);
    const roles = useRecoilValue(fetchServingRolesSelector(teamId));
    const team = useRecoilValue(teamAtom(teamId));
    const displayTitle = getDynamicDisplayTitle(schedule.service_tags, team?.service_tags, schedule.title);

    // Gather all member IDs involved in this schedule for batch fetching
    const allMemberIds = [
        ...(schedule.items?.flatMap(item => item.assignments.flatMap(a => a.memberIds)) || []),
        ...(schedule.worship_roles?.flatMap(a => a.memberIds) || []),
        ...(schedule.roles?.flatMap(r => r.memberIds) || []) // Fallback for really old data
    ];

    const members = useRecoilValue(usersAtom(allMemberIds));

    // Data Helpers
    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || "Unknown Role";
    const getMember = (uid: string) => members.find(m => m.id === uid);

    // Check if current user is serving in this schedule
    const isMeServing = currentUserUid ? (
        (schedule.items?.some(item => item.assignments.some(a => a.memberIds.includes(currentUserUid))) || false) ||
        (schedule.worship_roles?.some(a => a.memberIds.includes(currentUserUid)) || false) ||
        (schedule.roles?.some(r => r.memberIds.includes(currentUserUid)) || false)
    ) : false;

    // Date Logic
    const scheduleDate = schedule.date instanceof Timestamp
        ? schedule.date.toDate()
        : parseLocalDate(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = scheduleDate < today;

    // Toggle Handler
    // const toggleExpand = () => setIsExpanded(!isExpanded); // Replaced by hook

    // ...

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

        <BoardCard
            isExpanded={isExpanded}
            onClick={handleCardClick}
            onCollapse={(e) => {
                e.stopPropagation();
                toggleExpand();
            }}
        >
            <CardContent className="p-4 sm:p-6 pb-2 sm:pb-3">
                {/* Header */}
                <div className="group cursor-pointer select-none" onClick={handleHeaderClick}>

                    <div className="flex flex-col gap-1">
                        {/* Top Row: Chevron (Left) -- Actions (Right) */}
                        <div className="flex justify-between items-center">
                            {/* Expand Toggle Chevron */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-transparent -ml-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand();
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </Button>

                            {/* Right Actions */}
                            <div className="flex items-center gap-2">
                                {/* Worship Plan Link Button */}
                                {schedule.worship_id && onPreviewWorship && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPreviewWorship(schedule.worship_id!);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                                    >
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">See worship plan</span>
                                    </div>
                                )}

                                {/* Menu */}
                                <div onClick={(e) => e.stopPropagation()}>
                                    <ServingHeaderMenu scheduleId={schedule.id} teamId={teamId} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Title | Date */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-1">
                            {/* Title (Blue) */}
                            {displayTitle ? (
                                <h3 className="text-base sm:text-lg font-bold text-blue-500 tracking-tight leading-none">
                                    {displayTitle}
                                </h3>
                            ) : (
                                <h3 className="text-base sm:text-lg font-bold text-muted-foreground tracking-tight leading-none">
                                    Untitled
                                </h3>
                            )}

                            {/* Vertical Divider */}
                            <div className="hidden sm:block w-px h-6 bg-gray-300 transform rotate-12" />

                            {/* Date Group */}
                            <div className="flex items-baseline gap-2">
                                {/* MMM d (Bold) */}
                                <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                    {format(scheduleDate, "MMM d")}
                                </span>
                                {/* SUNDAY, yyyy (Muted, Uppercase) */}
                                <span className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">
                                    {format(scheduleDate, "EEEE, yyyy")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 mt-4 pt-4 border-t border-border"
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
                                {schedule.worship_roles && schedule.worship_roles.length > 0 && `, ${schedule.worship_roles.length} roles`}
                                , {allMemberIds.length} members assigned
                            </p>
                        )}
                    </motion.div>
                )}

            </CardContent>
        </BoardCard >
    );
}
