"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Plus, Trash2, MoreHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { TodoFormItem } from "../hooks/use-service-todos";

interface ServiceTodoStepProps {
    todos: TodoFormItem[];
    onAdd: (title: string) => void;
    onRemove: (id: string) => void;
    onToggle: (id: string) => void;
    onUpdate: (id: string, data: Partial<TodoFormItem>) => void;
}

export function ServiceTodoStep({ todos, onAdd, onRemove, onToggle, onUpdate }: ServiceTodoStepProps) {
    const [newTitle, setNewTitle] = useState("");

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        onAdd(newTitle);
        setNewTitle("");
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="space-y-2 text-center">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider">Step 4</Label>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Preparation Todos</h2>
                <p className="text-sm text-muted-foreground">Add todos to prepare for this service</p>
            </div>

            {/* Quick Add */}
            <div className="flex items-center gap-2 bg-card border border-border/50 rounded-2xl px-4 py-2 shadow-sm">
                <Plus className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === "Enter") handleAdd();
                    }}
                    placeholder="Add a prep todo..."
                    className="border-0 shadow-none px-0 h-10 text-[15px] font-medium focus-visible:ring-0 placeholder:text-muted-foreground/40"
                />
            </div>

            {/* Todo List */}
            <div className="space-y-2">
                <AnimatePresence initial={false}>
                    {todos.map((todo) => (
                        <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/30 group",
                                todo.completed && "opacity-50"
                            )}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => onToggle(todo.id)}
                                className={cn(
                                    "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                    todo.completed
                                        ? "bg-primary border-primary"
                                        : "border-muted-foreground/30 hover:border-primary/50"
                                )}
                            >
                                {todo.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                            </button>

                            {/* Title */}
                            <span className={cn(
                                "flex-1 text-sm font-semibold leading-snug tracking-tight",
                                todo.completed && "line-through text-muted-foreground"
                            )}>
                                {todo.title}
                            </span>

                            {/* Delete */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground flex-shrink-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-xl border-0">
                                    <DropdownMenuItem
                                        className="rounded-xl py-2.5 px-3 cursor-pointer font-semibold text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                                        onSelect={() => onRemove(todo.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {todos.length === 0 && (
                    <div className="py-8 text-center space-y-2">
                        <p className="text-sm text-muted-foreground/60">No preparation todos yet</p>
                        <p className="text-xs text-muted-foreground/40">Add todos like &quot;Print lyrics&quot; or &quot;Set up projector&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
}
