"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
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
                                "flex items-center gap-1.2 px-4 py-2 rounded-full border transition-all text-[15px] font-medium active:scale-95",
                                isSelected
                                    ? "bg-secondary border-primary text-foreground shadow-sm"
                                    : "bg-secondary/50 border-border/50 text-muted-foreground active:bg-secondary active:text-foreground active:border-border"
                            )}
                        >
                            {member.name}
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
    return (
        <Badge
            variant="secondary"
            className={cn(
                "pl-4 pr-1.5 py-1.5 rounded-full bg-secondary text-secondary-foreground border-0 flex items-center gap-1 text-[15px] font-medium shadow-sm transition-all",
                className
            )}
        >
            {name}
            {onRemove && (
                <button
                    className="hover:text-destructive transition-colors ml-1 rounded-full p-2.5 active:bg-destructive/10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
