"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, User, Eye, Link as LinkIcon } from "lucide-react";

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
    onPreviewWorship?: (worshipId: string) => void;
}

// Default expanded to true as requested
export function ServingCard({ schedule, teamId, currentUserUid, defaultExpanded = true, onPreviewWorship }: Props) {
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
                                {schedule.worshipId && onPreviewWorship && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPreviewWorship(schedule.worshipId!);
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
                            {schedule.title ? (
                                <h3 className="text-xl sm:text-2xl font-bold text-blue-500 tracking-tight leading-none">
                                    {schedule.title}
                                </h3>
                            ) : (
                                <h3 className="text-xl sm:text-2xl font-bold text-muted-foreground tracking-tight leading-none">
                                    Untitled
                                </h3>
                            )}

                            {/* Vertical Divider */}
                            <div className="hidden sm:block w-px h-6 bg-gray-300 transform rotate-12" />

                            {/* Date Group */}
                            <div className="flex items-baseline gap-2">
                                {/* MMM d (Bold) */}
                                <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
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
                                , {allMemberIds.length} members assigned
                            </p>
                        )}
                    </motion.div>
                )}

            </CardContent>
        </Card >
    );
}
