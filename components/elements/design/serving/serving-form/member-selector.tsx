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
        <div className="flex flex-col gap-6">
            <div className="relative mx-0.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    id="member-search"
                    name="member-search"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-muted/40 border-0 rounded-2xl text-base"
                />
            </div>

            <div className="space-y-4">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase px-1">
                    Members
                </p>

                <div className="grid gap-3">
                    {/* Option to add custom name */}
                    {searchQuery && !filteredMembers.find(m => m.name.toLowerCase() === searchQuery.toLowerCase()) && !manualEntries.includes(searchQuery) && (
                        <div
                            className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => {
                                onSelect(searchQuery);
                                setSearchQuery("");
                            }}
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                +
                            </div>
                            <div>
                                <p className="font-semibold text-primary">Add &quot;{searchQuery}&quot;</p>
                                <p className="text-sm text-muted-foreground">Guest / Manual Entry</p>
                            </div>
                        </div>
                    )}

                    {/* Manual Entries List */}
                    {displayedManualEntries.map((name) => (
                        <div
                            key={name}
                            className="flex items-center justify-between p-4 rounded-2xl border-2 bg-primary/5 border-primary cursor-pointer shadow-sm transition-all"
                            onClick={() => onSelect(name)}
                        >
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-foreground">{name}</p>
                                    <p className="text-sm text-muted-foreground">Guest</p>
                                </div>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground stroke-[3px]" />
                            </div>
                        </div>
                    ))}

                    {/* Team Members List */}
                    {filteredMembers.map((member) => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                    isSelected
                                        ? "bg-primary/5 border-primary shadow-sm"
                                        : "bg-card border-transparent hover:bg-muted/50"
                                )}
                                onClick={() => onSelect(member.id)}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <Avatar className="h-12 w-12 shadow-sm">
                                        <AvatarFallback className="font-bold bg-muted text-muted-foreground">{member.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{member.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
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

                    {filteredMembers.length === 0 && displayedManualEntries.length === 0 && !searchQuery && (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            Search members or add guests by name
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
