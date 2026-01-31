"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, UserPlus, CalendarClock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { Todo } from "@/models/todo";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";

interface TodoDetailSheetProps {
    todo: Todo | null;
    teamMembers: any[];
    onClose: () => void;
    onUpdate: (todoId: string, data: Partial<Todo>) => void;
    onDelete: (todoId: string) => void;
}

export function TodoDetailSheet({ todo, teamMembers, onClose, onUpdate, onDelete }: TodoDetailSheetProps) {
    const [editTitle, setEditTitle] = useState("");
    const [editDueDate, setEditDueDate] = useState<Date | undefined>();
    const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync state when todo changes
    useEffect(() => {
        if (todo) {
            setEditTitle(todo.title);
            setEditDueDate(todo.dueDate?.toDate() || undefined);
            setEditAssigneeIds(todo.assigneeIds || []);
            setHasChanges(false);
            setShowCalendar(false);
            setShowMembers(false);
        }
    }, [todo]);

    const handleSave = () => {
        if (!todo || !hasChanges) return;
        const updates: Partial<Todo> = {};
        if (editTitle !== todo.title) updates.title = editTitle;
        if (JSON.stringify(editAssigneeIds) !== JSON.stringify(todo.assigneeIds)) updates.assigneeIds = editAssigneeIds;

        const newDueDate = editDueDate ? Timestamp.fromDate(editDueDate) : null;
        const oldDueDate = todo.dueDate;
        if (newDueDate?.seconds !== oldDueDate?.seconds) updates.dueDate = newDueDate;

        if (Object.keys(updates).length > 0) {
            onUpdate(todo.id, updates);
        } else {
            onClose();
        }
    };

    const handleDelete = () => {
        if (!todo) return;
        onDelete(todo.id);
        onClose();
    };

    const toggleAssignee = (memberId: string) => {
        setEditAssigneeIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
        setHasChanges(true);
    };

    return (
        <Drawer open={!!todo} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-h-[88vh] rounded-t-[2.5rem]">
                <div className="mx-auto w-full max-w-lg flex flex-col px-6 pt-6 pb-10">
                    <DrawerDescription className="sr-only">Edit todo details</DrawerDescription>

                    {/* Drawer Handle */}
                    <div className="w-12 h-1.5 rounded-full bg-muted/60 mx-auto mb-6" />

                    {/* Title */}
                    <DrawerTitle className="sr-only">Edit Task</DrawerTitle>
                    <Input
                        value={editTitle}
                        onChange={(e) => { setEditTitle(e.target.value); setHasChanges(true); }}
                        onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing) return;
                            if (e.key === "Enter") handleSave();
                        }}
                        className="border-0 shadow-none px-0 h-auto text-2xl font-bold focus-visible:ring-0 placeholder:text-muted-foreground/30 leading-tight tracking-tight mb-4"
                        placeholder="Task title..."
                    />

                    {/* Service Link (read-only) */}
                    {todo?.serviceTitle && (
                        <div className="mb-6">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                {todo.serviceTitle}
                            </span>
                        </div>
                    )}

                    {/* Due Date Section */}
                    <div className="mt-2">
                        <button
                            onClick={() => { setShowCalendar(!showCalendar); setShowMembers(false); }}
                            className={cn(
                                "flex items-center gap-3 w-full p-4 rounded-2xl border transition-all active:scale-[0.98]",
                                editDueDate
                                    ? "bg-card border-border/40 shadow-sm"
                                    : "bg-muted/30 border-border/30"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                editDueDate ? "bg-primary/10" : "bg-muted/50"
                            )}>
                                <CalendarClock className={cn(
                                    "w-5 h-5",
                                    editDueDate ? "text-primary" : "text-muted-foreground/50"
                                )} strokeWidth={2.5} />
                            </div>
                            <span className={cn(
                                "text-sm font-bold flex-1 text-left",
                                editDueDate ? "text-foreground" : "text-muted-foreground/60"
                            )}>
                                {editDueDate ? format(editDueDate, "EEEE, MMM d, yyyy") : "Set due date"}
                            </span>
                            {editDueDate && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditDueDate(undefined); setHasChanges(true); }}
                                    className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                                </button>
                            )}
                        </button>

                        {showCalendar && (
                            <div className="mt-3 flex justify-center p-4 bg-card rounded-2xl border border-border/40 shadow-sm">
                                <Calendar
                                    mode="single"
                                    selected={editDueDate}
                                    onSelect={(date) => { setEditDueDate(date); setHasChanges(true); setShowCalendar(false); }}
                                    className="rounded-xl"
                                />
                            </div>
                        )}
                    </div>

                    {/* Assignees Section */}
                    <div className="mt-3">
                        <button
                            onClick={() => { setShowMembers(!showMembers); setShowCalendar(false); }}
                            className={cn(
                                "flex items-center gap-3 w-full p-4 rounded-2xl border transition-all active:scale-[0.98]",
                                editAssigneeIds.length > 0
                                    ? "bg-card border-border/40 shadow-sm"
                                    : "bg-muted/30 border-border/30"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                editAssigneeIds.length > 0 ? "bg-primary/10" : "bg-muted/50"
                            )}>
                                <UserPlus className={cn(
                                    "w-5 h-5",
                                    editAssigneeIds.length > 0 ? "text-primary" : "text-muted-foreground/50"
                                )} strokeWidth={2.5} />
                            </div>
                            <span className={cn(
                                "text-sm font-bold flex-1 text-left line-clamp-2",
                                editAssigneeIds.length > 0 ? "text-foreground" : "text-muted-foreground/60"
                            )}>
                                {editAssigneeIds.length > 0
                                    ? editAssigneeIds.map(id => teamMembers.find(m => m.id === id)?.name || "Unknown").join(", ")
                                    : "Assign members"
                                }
                            </span>
                        </button>

                        {showMembers && (
                            <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto rounded-2xl border border-border/40 p-2 bg-card shadow-sm">
                                {teamMembers.map((member) => (
                                    <button
                                        key={member.id}
                                        onClick={() => toggleAssignee(member.id)}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-150 active:scale-[0.97] text-left",
                                            editAssigneeIds.includes(member.id)
                                                ? "bg-primary/10 shadow-sm"
                                                : "hover:bg-muted/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm",
                                            editAssigneeIds.includes(member.id)
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            {editAssigneeIds.includes(member.id)
                                                ? <Check className="w-5 h-5" strokeWidth={3} />
                                                : member.name?.charAt(0)?.toUpperCase() || "?"
                                            }
                                        </div>
                                        <span className="text-sm font-semibold">{member.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        <Button
                            variant="outline"
                            className="h-14 rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 font-bold shadow-sm active:scale-95 transition-all"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-5 h-5 mr-2" strokeWidth={2.5} />
                            Delete
                        </Button>
                        <Button
                            className="flex-1 h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all text-base tracking-tight disabled:opacity-40"
                            onClick={handleSave}
                            disabled={!hasChanges || !editTitle.trim()}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
