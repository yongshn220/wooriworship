"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

/**
 * Common "Add" button used for adding roles or sequences.
 */
interface AddActionButtonProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    className?: string;
}

export function AddActionButton({ label, onClick, icon, className }: AddActionButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn(
                "w-full h-14 border-dashed border-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-2xl text-sm font-semibold gap-2",
                className
            )}
            onClick={onClick}
        >
            {icon || <Plus className="h-5 w-5" />}
            {label}
        </Button>
    );
}

/**
 * Common Card container for roles and sequences.
 */
interface ServingCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function ServingCard({ children, className, onClick }: ServingCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group flex flex-col gap-4 p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-all",
                onClick && "active:scale-[0.98] cursor-pointer",
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * Suggestion list for members in Step 2.
 */
interface Member {
    id: string;
    name: string;
}

interface MemberSuggestionListProps {
    members: Member[];
    selectedIds: string[];
    onSelect: (id: string) => void;
}

export function MemberSuggestionList({ members, selectedIds, onSelect }: MemberSuggestionListProps) {
    if (members.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 mt-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">SUGGESTED</p>
            <div className="flex flex-wrap gap-2.5">
                {members.map((member) => {
                    const isSelected = selectedIds.includes(member.id);
                    return (
                        <button
                            key={member.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(member.id);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[13px] font-bold active:scale-95",
                                isSelected
                                    ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 active:bg-gray-50"
                            )}
                        >
                            {member.name.replace(/^group:/, "")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface MemberBadgeProps {
    name: string;
    onRemove?: () => void;
    className?: string;
    isMe?: boolean;
}

export function MemberBadge({ name, onRemove, className, isMe = false }: MemberBadgeProps) {
    const isGroup = name.startsWith("group:");
    const displayName = name.replace(/^group:/, "");

    const handleBadgeClick = (e: React.MouseEvent) => {
        if (onRemove) {
            e.stopPropagation();
            onRemove();
        }
    };

    return (
        <Badge
            variant="secondary"
            className={cn(
                "h-8 pl-3 pr-1.5 gap-1.5 font-bold transition-all group flex items-center justify-between rounded-full",
                // Default (Theme Color)
                "bg-primary/10 text-primary hover:bg-primary/20 border-primary/10",
                // Me (Blue) overrides Default
                isMe && "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
                // Remove (Red Hover) overrides all on hover
                onRemove && "cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-100",
                className
            )}
            onClick={handleBadgeClick}
        >
            <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isMe ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary"
            )}>
                {isGroup ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            {displayName}
            {onRemove && (
                <button
                    className="hover:text-red-500 transition-colors ml-0.5 rounded-full p-1 active:bg-red-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>
            )}
        </Badge>
    );
}

/**
 * Reusable Row Component for Worship Team displaying Role and Members vertically or horizontally.
 * Used in Step 3 (SortableWorshipItem) and Step 4 (Review).
 */
interface WorshipTeamRoleRowProps {
    roleName: string;
    memberIds: string[];
    getMemberName: (id: string) => string;
    className?: string;
    currentUserUid?: string | null;
}

export function WorshipTeamRoleRow({ roleName, memberIds, getMemberName, className, currentUserUid }: WorshipTeamRoleRowProps) {
    if (memberIds.length === 0) return null;

    return (
        <div className={cn("flex flex-row items-start justify-between w-full gap-4", className)}>
            {/* Role Name - Left (or Right depending on context if flipped, but default is Left) */}
            {/* Based on user request "Left Role, Right Member List". In Step 4 usually it's "Right Aligned" structure.
                But the user explicitly said: "Left Role, Right Member List... Full width".
                The Step 4 existing structure was Role on Left of the *content block*.
                Wait, Step 4 has a Timeline layout:
                [Index] [Content Block]
                        [Title]   [Assignments]

                If the user wants "Left Role, Right Name" for the *Worship Team* item specifically, inside that content block?
                Yes. "cuelist 에서 찬양팀 구성 member name list 는 특별하게 왼쪽에 role 오른쪽에 사람 이름 listup 하도록 바꿔."
            */}
            <span className="text-[13px] font-bold text-gray-500 uppercase tracking-tight mt-1.5 min-w-fit text-left">
                {roleName}:
            </span>
            <div className="flex flex-col items-end gap-1 flex-1">
                {memberIds.map(uid => (
                    <MemberBadge
                        key={uid}
                        name={getMemberName(uid)}
                        className="bg-secondary/40 border-transparent h-7 text-xs px-2.5 max-w-[140px] truncate justify-between w-auto" // Adjusted for better visibility
                        isMe={currentUserUid === uid}
                    />
                ))}
            </div>
        </div>
    );
}

interface SuggestedMemberChipsProps {
    suggestions: { id: string; name: string }[];
    onSelect: (id: string) => void;
}

export function SuggestedMemberChips({ suggestions, onSelect }: SuggestedMemberChipsProps) {
    if (suggestions.length === 0) return null;

    return (
        <>
            {suggestions.map(member => (
                <button
                    key={member.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(member.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-dashed border-gray-300 rounded-full text-[13px] font-normal text-gray-500 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-3.5 h-3.5" />
                    {member.name.replace(/^group:/, "")}
                </button>
            ))}
        </>
    );
}

interface AssignmentControlProps {
    assignedMembers: { id: string; name: string }[];
    suggestions: { id: string; name: string }[];
    onAddMember: (id: string) => void;
    onRemoveMember: (id: string, assignmentIndex?: number) => void;
    onOpenAdd: () => void;
    placeholder?: string;
    isGroup?: (name: string) => boolean;
}

export function AssignmentControl({
    assignedMembers,
    suggestions,
    onAddMember,
    onRemoveMember,
    onOpenAdd,
    placeholder = "Assign Member",
    isGroup = (name) => name.startsWith("group:")
}: AssignmentControlProps) {
    const isAssigned = assignedMembers.length > 0;
    const hasSuggestions = suggestions.length > 0;

    return (
        <div
            className="flex items-center justify-between pointer-events-none"
        >
            <div className="flex flex-wrap gap-2.5 pointer-events-auto">
                {/* Assigned Members */}
                {assignedMembers.map((member) => (
                    <MemberBadge
                        key={member.id}
                        name={member.name}
                        onRemove={() => onRemoveMember(member.id)}
                    />
                ))}

                {/* Suggestions */}
                <SuggestedMemberChips
                    suggestions={suggestions.filter(s => !assignedMembers.some(m => m.id === s.id))}
                    onSelect={(id) => onAddMember(id)}
                />

                {/* Placeholder Button (Only if empty) */}
                {!isAssigned && !hasSuggestions && (
                    <div
                        className="flex items-center gap-3 text-gray-400 group-hover:text-blue-500 transition-colors py-1 pointer-events-none"
                    >
                        <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                            <Plus className="text-gray-300 w-4 h-4 group-hover:text-blue-500" />
                        </div>
                        <span className="text-[13px] font-normal">{placeholder}</span>
                    </div>
                )}
            </div>

            {/* Right Side Add Button (If content exists) */}
            {(isAssigned || hasSuggestions) && (
                <div
                    className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center transition-colors flex-shrink-0 ml-2 group-hover:bg-blue-100 active:scale-95"
                >
                    <Plus className="text-blue-500 w-4 h-4" />
                </div>
            )}
        </div>
    );
}
