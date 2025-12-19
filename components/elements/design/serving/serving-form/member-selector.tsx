"use client";

import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
    selectedMemberIds: string[];
    onSelect: (memberId: string) => void;
    multiple?: boolean;
}

export function MemberSelector({ selectedMemberIds, onSelect, multiple = false }: Props) {
    const teamId = useRecoilValue(currentTeamIdAtom);
    const team = useRecoilValue(teamAtom(teamId));
    const members = useRecoilValue(usersAtom(team?.users));
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Identify selected members that are NOT in the official team list (Manual entries)
    const manualEntries = selectedMemberIds.filter(id => !members.find(m => m.id === id));

    // Filter manual entries based on search query if present
    const displayedManualEntries = manualEntries.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search or type name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/50 border-0"
                />
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4 min-h-0">
                <div className="space-y-2 pb-2">
                    {/* Option to add custom name */}
                    {searchQuery && !filteredMembers.find(m => m.name.toLowerCase() === searchQuery.toLowerCase()) && !manualEntries.includes(searchQuery) && (
                        <div
                            className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => {
                                onSelect(searchQuery);
                                setSearchQuery("");
                            }}
                        >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                +
                            </div>
                            <div>
                                <p className="font-medium text-sm text-primary">Add "{searchQuery}"</p>
                                <p className="text-xs text-muted-foreground">Guest / Manual Entry</p>
                            </div>
                        </div>
                    )}

                    {/* Manual Entries List */}
                    {displayedManualEntries.map((name) => (
                        <div
                            key={name}
                            className="flex items-center justify-between p-3 rounded-xl border bg-primary/10 border-primary cursor-pointer transition-all"
                            onClick={() => onSelect(name)}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-white">
                                    <AvatarFallback className="bg-primary text-primary-foreground">{name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{name}</p>
                                    <p className="text-xs text-muted-foreground">Guest</p>
                                </div>
                            </div>
                            <Check className="h-5 w-5 text-primary" />
                        </div>
                    ))}

                    {/* Team Members List */}
                    {filteredMembers.map((member) => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                    isSelected
                                        ? "bg-primary/10 border-primary"
                                        : "bg-card border-border hover:bg-muted"
                                )}
                                onClick={() => onSelect(member.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                {isSelected && <Check className="h-5 w-5 text-primary" />}
                            </div>
                        );
                    })}

                    {filteredMembers.length === 0 && displayedManualEntries.length === 0 && !searchQuery && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Start typing to search or add a guest
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
