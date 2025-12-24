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
}

export function MemberBadge({ name, onRemove, className }: MemberBadgeProps) {
    const isGroup = name.startsWith("group:");
    const displayName = name.replace(/^group:/, "");

    return (
        <Badge
            variant="secondary"
            className={cn(
                "pl-1 pr-1.5 py-1 rounded-full bg-white border border-gray-100 text-gray-600 flex items-center gap-1.5 text-[13px] font-bold shadow-sm transition-all",
                className
            )}
        >
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
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
