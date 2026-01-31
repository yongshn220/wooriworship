"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Todo } from "@/models/todo";

interface TodoItemProps {
    todo: Todo;
    teamMembers: any[];
    onToggle: () => void;
    onTap: () => void;
    onDelete: () => void;
    onUpdate: (data: Partial<Todo>) => void;
}

export function TodoItem({ todo, teamMembers, onToggle, onTap, onDelete }: TodoItemProps) {
    const assigneeNames = todo.assigneeIds
        .map(id => teamMembers.find(m => m.id === id)?.name || "Unknown")
        .slice(0, 2);

    const remainingAssignees = Math.max(0, todo.assigneeIds.length - 2);

    return (
        <div className={cn(
            "flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm transition-all active:scale-[0.98] group",
            todo.completed && "opacity-50 bg-muted/20"
        )}>
            {/* Checkbox */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={cn(
                    "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all active:scale-90",
                    todo.completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30 hover:border-primary/50"
                )}
            >
                {todo.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>

            {/* Content - tappable area */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onTap}>
                <p className={cn(
                    "text-sm font-semibold leading-snug tracking-tight",
                    todo.completed && "line-through text-muted-foreground"
                )}>
                    {todo.title}
                </p>

                {/* Meta row: service chip + assignees */}
                {(todo.serviceTitle || assigneeNames.length > 0) && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Service chip */}
                        {todo.serviceTitle && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                                {todo.serviceTitle}
                            </span>
                        )}

                        {/* Assignee names */}
                        {assigneeNames.length > 0 && (
                            <span className="text-[11px] text-muted-foreground font-medium">
                                {assigneeNames.join(", ")}
                                {remainingAssignees > 0 && ` +${remainingAssignees}`}
                            </span>
                        )}

                    </div>
                )}
            </div>

            {/* Context Menu - Always visible on mobile */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-90"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-xl border-0">
                    <DropdownMenuItem
                        className="rounded-xl py-2.5 px-3 cursor-pointer font-semibold text-sm"
                        onSelect={onTap}
                    >
                        <Pencil className="mr-3 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                    <DropdownMenuItem
                        className="rounded-xl py-2.5 px-3 cursor-pointer font-semibold text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                        onSelect={onDelete}
                    >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
