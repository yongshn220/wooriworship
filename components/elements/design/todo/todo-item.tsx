"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, EllipsisVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Todo } from "@/models/todo";

interface TodoItemProps {
    todo: Todo;
    onToggle: () => void;
    onDelete: () => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
    const serviceLabel = todo.serviceTitle
        ? todo.serviceDate
            ? `${todo.serviceTitle} \u00b7 ${format(todo.serviceDate.toDate(), "MMM d")}`
            : todo.serviceTitle
        : null;

    return (
        <div className={cn(
            "flex items-start gap-3 px-3 py-3 rounded-xl bg-card border border-border shadow-sm transition-all active:scale-[0.98] group",
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

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-semibold leading-snug tracking-tight",
                    todo.completed && "line-through text-muted-foreground"
                )}>
                    {todo.title}
                </p>

                {/* Service chip */}
                {serviceLabel && (
                    <div className="mt-1.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                            {serviceLabel}
                        </span>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <button
                        className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-90 inline-flex items-center justify-center outline-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EllipsisVertical className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        className="flex items-center justify-between cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500"
                        onSelect={onDelete}
                    >
                        Delete
                        <Trash2 className="h-4 w-4" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
