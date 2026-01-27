"use client";

import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { Input } from "@/components/ui/input";
import { Check, Plus, Search, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
    selectedMemberIds: string[];
    onSelect: (memberId: string) => void;
    multiple?: boolean;
    groups?: string[];
    onAddGroup?: (name: string) => void;
    onRemoveGroup?: (index: number) => void;
    customMemberNames?: string[];
    onAddCustomMember?: (name: string) => void;
}

export function MemberSelector({
    selectedMemberIds,
    onSelect,
    multiple = false,
    groups = [],
    onAddGroup,
    onRemoveGroup,
    customMemberNames = [],
    onAddCustomMember,
    searchQuery = ""
}: Props & { searchQuery?: string }) {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const members = useRecoilValue(usersAtom(team?.users));

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter(group =>
        group.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Identify selected members that are NOT in the official team list (Manual entries)
    const manualEntries = selectedMemberIds.filter(id =>
        !members.find(m => m.id === id) && !id.startsWith("group:")
    );

    // Filter manual entries based on search query if present
    const displayedManualEntries = manualEntries.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddAsGroup = () => {
        if (onAddGroup && searchQuery.trim()) {
            const groupName = searchQuery.trim();
            onAddGroup(groupName);
            onSelect(`group:${groupName}`);
        }
    };

    const handleAddAsMember = () => {
        const name = searchQuery.trim();
        onSelect(name);
        if (onAddCustomMember) {
            onAddCustomMember(name);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="space-y-6">
                {/* Groups Section */}
                {(filteredGroups.length > 0 || (searchQuery && onAddGroup)) && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground/50 uppercase px-4">
                            Groups
                        </p>
                        <div className="space-y-0.5">
                            {filteredGroups.map((group, idx) => {
                                const groupId = `group:${group}`;
                                const isSelected = selectedMemberIds.includes(groupId);
                                return (
                                    <div
                                        key={`group-item-${idx}`}
                                        className={cn(
                                            "flex items-center justify-between py-2.5 px-4 rounded-xl transition-all cursor-pointer group",
                                            isSelected
                                                ? "bg-primary/5"
                                                : "hover:bg-muted/50"
                                        )}
                                        onClick={() => onSelect(groupId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-[15px] text-foreground">{group}</p>
                                        </div>
                                        <div className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-primary shadow-sm"
                                                : "border-[1.5px] border-muted-foreground/30"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-primary-foreground stroke-[3px]" />}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add as Group Button */}
                            {searchQuery && onAddGroup && !groups.find(g => g.toLowerCase() === searchQuery.toLowerCase()) && (
                                <button
                                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left"
                                    onClick={handleAddAsGroup}
                                >
                                    <Plus className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-[15px] text-primary truncate flex-1">Add &quot;{searchQuery}&quot;</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Members Section */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground/50 uppercase px-4">
                        Members
                    </p>

                    <div className="space-y-0.5">
                        {/* Unified Guest List (Custom + Manual) */}
                        {(() => {
                            // Combine custom names and manual entries, deduplicate
                            const allGuestNames = Array.from(new Set([...customMemberNames, ...manualEntries]));
                            // Filter out any that might conflict with official members (safety)
                            const validGuestNames = allGuestNames.filter(name => !members.find(m => m.name === name));
                            // Filter by search
                            const filteredGuests = validGuestNames.filter(name =>
                                name.toLowerCase().includes(searchQuery.toLowerCase())
                            );

                            return filteredGuests.map(name => {
                                const isSelected = selectedMemberIds.includes(name);
                                return (
                                    <div
                                        key={name}
                                        className={cn(
                                            "flex items-center justify-between py-2.5 px-4 rounded-xl transition-all cursor-pointer group",
                                            isSelected
                                                ? "bg-primary/5"
                                                : "hover:bg-muted/50"
                                        )}
                                        onClick={() => onSelect(name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-semibold text-[15px] text-foreground">{name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium">Guest</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-primary shadow-sm"
                                                : "border-[1.5px] border-muted-foreground/30"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3 text-primary-foreground stroke-[3px]" />}
                                        </div>
                                    </div>
                                );
                            });
                        })()}

                        {/* Add as Member Button */}
                        {searchQuery &&
                            !members.find(m => m.name.toLowerCase() === searchQuery.toLowerCase()) &&
                            !manualEntries.includes(searchQuery) &&
                            !customMemberNames.includes(searchQuery) && (
                                <button
                                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left mb-1"
                                    onClick={handleAddAsMember}
                                >
                                    <Plus className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-[15px] text-primary truncate flex-1">Add &quot;{searchQuery}&quot;</span>
                                </button>
                            )}

                        {/* Team Members List */}
                        {filteredMembers.map((member) => {
                            const isSelected = selectedMemberIds.includes(member.id);
                            return (
                                <div
                                    key={member.id}
                                    className={cn(
                                        "flex items-center justify-between py-2.5 px-4 rounded-xl transition-all cursor-pointer group",
                                        isSelected
                                            ? "bg-primary/5"
                                            : "hover:bg-muted/50"
                                    )}
                                    onClick={() => onSelect(member.id)}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[15px] truncate text-foreground leading-tight">{member.name}</p>
                                            <p className="text-[11px] truncate font-normal text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "h-5 w-5 rounded-full flex items-center justify-center transition-all",
                                        isSelected
                                            ? "bg-primary shadow-sm"
                                            : "border-[1.5px] border-muted-foreground/30"
                                    )}>
                                        {isSelected && <Check className="h-3 w-3 text-primary-foreground stroke-[3px]" />}
                                    </div>
                                </div>
                            );
                        })}

                        {(filteredMembers.length === 0 && displayedManualEntries.length === 0 && filteredGroups.length === 0 && !searchQuery) && (
                            <div className="text-center py-12 text-muted-foreground/40 text-xs italic">
                                Search names, emails or groups...
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}
