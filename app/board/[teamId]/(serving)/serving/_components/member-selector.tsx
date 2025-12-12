"use client";

import { useRecoilValue } from "recoil";
import { currentTeamIdAtom, teamAtom } from "@/global-states/teamState";
import { usersAtom } from "@/global-states/userState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
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

    return (
        <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-2">
                {members.map((member) => {
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
            </div>
        </ScrollArea>
    );
}
