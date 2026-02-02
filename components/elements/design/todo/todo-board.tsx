"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRecoilState } from "recoil";
import { cn } from "@/lib/utils";
import { Plus, ListChecks, Check, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyStateCard } from "@/components/elements/design/common/empty-state-card";
import { TodoApi } from "@/apis/TodoApi";
import { Todo } from "@/models/todo";
import { todoListAtom, todoUpdaterAtom, showCompletedAtom } from "@/global-states/todoState";
import { auth } from "@/firebase";
import { Timestamp } from "firebase/firestore";
import { TodoItem } from "./todo-item";
import { AnimatePresence, motion } from "framer-motion";

interface TodoBoardProps {
    teamId: string;
}

export function TodoBoard({ teamId }: TodoBoardProps) {
    const [todoList, setTodoList] = useRecoilState(todoListAtom);
    const [updater, setUpdater] = useRecoilState(todoUpdaterAtom);
    const [showCompleted, setShowCompleted] = useRecoilState(showCompletedAtom);

    const [newTodoTitle, setNewTodoTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const currentUserId = auth.currentUser?.uid || "";

    // Fetch todos
    const fetchTodos = useCallback(async () => {
        try {
            setIsLoading(true);
            let todos = await TodoApi.getTodos(teamId);

            // If showCompleted, also fetch completed todos
            if (showCompleted) {
                const completedTodos = await TodoApi.getTodos(teamId, { completed: true });
                // Merge: incomplete first, then completed
                const incompleteIds = new Set(todos.map(t => t.id));
                const uniqueCompleted = completedTodos.filter(t => !incompleteIds.has(t.id));
                todos = [...todos, ...uniqueCompleted];
            }

            setTodoList(todos);
        } catch (error) {
            console.error("Failed to fetch todos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [teamId, showCompleted, setTodoList]);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos, updater]);

    // Quick add handler
    const handleQuickAdd = async () => {
        const title = newTodoTitle.trim();
        if (!title) return;

        try {
            const newTodo: Omit<Todo, 'id'> = {
                teamId,
                title,
                completed: false,
                completedAt: null,
                completedBy: null,
                assigneeIds: [],
                serviceId: null,
                serviceTitle: null,
                serviceDate: null,
                dueDate: null,
                createdBy: currentUserId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                order: 0,
            };

            await TodoApi.createTodo(teamId, newTodo);
            setNewTodoTitle("");
            setUpdater(prev => prev + 1);
        } catch (error) {
            console.error("Failed to create todo:", error);
        }
    };

    // Toggle completion
    const handleToggle = async (todo: Todo) => {
        // Optimistic update
        setTodoList(prev => prev.map(t =>
            t.id === todo.id
                ? { ...t, completed: !t.completed, completedAt: !t.completed ? Timestamp.now() : null, completedBy: !t.completed ? currentUserId : null }
                : t
        ));

        try {
            await TodoApi.toggleTodo(teamId, todo.id, !todo.completed, currentUserId);
            // Re-fetch after a short delay if hiding completed
            if (!todo.completed && !showCompleted) {
                setTimeout(() => setUpdater(prev => prev + 1), 500);
            }
        } catch (error) {
            console.error("Failed to toggle todo:", error);
            setUpdater(prev => prev + 1); // Revert by re-fetching
        }
    };

    // Delete
    const handleDelete = async (todoId: string) => {
        setTodoList(prev => prev.filter(t => t.id !== todoId));
        try {
            await TodoApi.deleteTodo(teamId, todoId);
        } catch (error) {
            console.error("Failed to delete todo:", error);
            setUpdater(prev => prev + 1);
        }
    };

    const incompleteTodos = todoList.filter(t => !t.completed);
    const completedTodos = todoList.filter(t => t.completed);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Show Completed Toggle */}
            <div className="flex items-center justify-end px-5 py-3">
                <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                        showCompleted
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                        showCompleted
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                    )}>
                        {showCompleted && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    Show completed
                </button>
            </div>

            {/* Quick Add Input */}
            <div className="px-5 pb-4">
                <div className="flex items-center gap-2 bg-card border border-border/50 rounded-2xl px-4 py-2 shadow-sm transition-all focus-within:border-primary/30 focus-within:shadow-md">
                    <Plus className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                    <Input
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing) return;
                            if (e.key === "Enter" && newTodoTitle.trim()) {
                                handleQuickAdd();
                            }
                        }}
                        placeholder="Add a todo..."
                        className="border-0 shadow-none px-0 h-10 text-[15px] font-medium focus-visible:ring-0 placeholder:text-muted-foreground/40"
                    />
                    {newTodoTitle.trim() && (
                        <button
                            onClick={handleQuickAdd}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
                        >
                            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            {/* Todo List */}
            <div className="flex-1 overflow-y-auto px-5 pb-32">
                {isLoading && todoList.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-xl bg-card animate-pulse">
                                <Skeleton className="w-5 h-5 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4 rounded-md" />
                                    <Skeleton className="h-3 w-1/3 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : incompleteTodos.length === 0 && !showCompleted ? (
                    <EmptyStateCard
                        icon={ListChecks}
                        iconColorClassName="bg-muted/40 text-muted-foreground"
                        message="No todos yet"
                        description="Add your first todo above"
                    />
                ) : (
                    <div className="space-y-2.5 pt-1">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {incompleteTodos.map((todo, index) => (
                                <motion.div
                                    key={todo.id}
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: isLoading ? index * 0.03 : 0,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    layout
                                >
                                    <TodoItem
                                        todo={todo}
                                        onToggle={() => handleToggle(todo)}
                                        onDelete={() => handleDelete(todo.id)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Completed Section */}
                        {showCompleted && completedTodos.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="pt-6"
                            >
                                <div className="flex items-center gap-2 px-2 pb-3 border-t border-border/30 pt-4">
                                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider mx-auto">
                                        Done ({completedTodos.length})
                                    </p>
                                </div>
                                <div className="space-y-2.5">
                                    <AnimatePresence mode="popLayout">
                                        {completedTodos.map((todo) => (
                                            <motion.div
                                                key={todo.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <TodoItem
                                                    todo={todo}
                                                    onToggle={() => handleToggle(todo)}
                                                    onDelete={() => handleDelete(todo.id)}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
