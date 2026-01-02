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
    onAddCustomMember
}: Props) {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const members = useRecoilValue(usersAtom(team?.users));
    const [searchQuery, setSearchQuery] = useState("");

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
            onAddGroup(searchQuery.trim());
            setSearchQuery("");
        }
    };

    const handleAddAsMember = () => {
        const name = searchQuery.trim();
        onSelect(name);
        if (onAddCustomMember) {
            onAddCustomMember(name);
        }
        setSearchQuery("");
    };

    return (
        <div className="flex flex-col">
            {/* Search Bar at the Top */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                <Input
                    id="member-search"
                    name="member-search"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-muted/30 border-0 rounded-2xl text-[16px] ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40"
                    autoFocus
                />
            </div>

            <div className="space-y-8">
                {/* Groups Section */}
                {(filteredGroups.length > 0 || (searchQuery && onAddGroup)) && (
                    <div className="space-y-4">
                        <p className="text-xs font-bold tracking-wider text-muted-foreground/60 uppercase px-1">
                            Groups
                        </p>
                        <div className="space-y-1">
                            {filteredGroups.map((group, idx) => {
                                const groupId = `group:${group}`;
                                const isSelected = selectedMemberIds.includes(groupId);
                                return (
                                    <div
                                        key={`group-item-${idx}`}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group",
                                            isSelected
                                                ? "bg-primary/5 shadow-sm"
                                                : "hover:bg-muted/50"
                                        )}
                                        onClick={() => onSelect(groupId)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/60">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <p className="font-bold text-lg text-foreground">{group}</p>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-primary shadow-sm"
                                                : "border-2 border-muted"
                                        )}>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4px]" />}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add as Group Button */}
                            {searchQuery && onAddGroup && !groups.find(g => g.toLowerCase() === searchQuery.toLowerCase()) && (
                                <button
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left"
                                    onClick={handleAddAsGroup}
                                >
                                    <Plus className="h-5 w-5 text-primary" />
                                    <span className="font-bold text-primary truncate flex-1">Add &quot;{searchQuery}&quot;</span>
                                </button>
                            )}
                        </div>
                        <div className="h-px bg-border/50 mx-1" />
                    </div>
                )}

                {/* Members Section */}
                <div className="space-y-4">
                    <p className="text-xs font-bold tracking-wider text-muted-foreground/60 uppercase px-1">
                        Members
                    </p>

                    <div className="space-y-1">
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
                                            "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group",
                                            isSelected
                                                ? "bg-primary/5 shadow-sm"
                                                : "hover:bg-muted/50"
                                        )}
                                        onClick={() => onSelect(name)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-muted/50 text-muted-foreground/60">
                                                    <User className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-lg text-foreground">{name}</p>
                                                <p className="text-sm text-muted-foreground font-medium">Guest</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-primary shadow-sm"
                                                : "border-2 border-muted"
                                        )}>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4px]" />}
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
                                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left mb-2"
                                    onClick={handleAddAsMember}
                                >
                                    <Plus className="h-5 w-5 text-primary" />
                                    <span className="font-bold text-primary truncate flex-1">Add &quot;{searchQuery}&quot;</span>
                                </button>
                            )}

                        {/* Team Members List */}
                        {filteredMembers.map((member) => {
                            const isSelected = selectedMemberIds.includes(member.id);
                            return (
                                <div
                                    key={member.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group",
                                        isSelected
                                            ? "bg-primary/5 shadow-sm"
                                            : "hover:bg-muted/50"
                                    )}
                                    onClick={() => onSelect(member.id)}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                            <AvatarFallback className="bg-muted/50 text-muted-foreground/60">
                                                <User className="h-5 w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-bold text-lg truncate text-foreground">{member.name}</p>
                                            <p className="text-sm truncate font-medium text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                                        isSelected
                                            ? "bg-primary shadow-sm"
                                            : "border-2 border-muted"
                                    )}>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4px]" />}
                                    </div>
                                </div>
                            );
                        })}

                        {(filteredMembers.length === 0 && displayedManualEntries.length === 0 && filteredGroups.length === 0 && !searchQuery) && (
                            <div className="text-center py-12 text-muted-foreground/60 text-sm italic">
                                Search names, emails or groups...
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}
