"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CircleCheck, Plus, Check, MoreHorizontal, Trash2, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SectionHeader, SectionCardContainer } from "@/components/common/section-card";
import { TodoApi } from "@/apis/TodoApi";
import { Todo } from "@/models/todo";
import { auth } from "@/firebase";
import { Timestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useSetRecoilState } from "recoil";
import { todoUpdaterAtom } from "@/global-states/todoState";

interface ServiceTodoCardProps {
  teamId: string;
  serviceId: string;
  serviceTitle: string;
  serviceDate: Timestamp;
}

export function ServiceTodoCard({
  teamId,
  serviceId,
  serviceTitle,
  serviceDate,
}: ServiceTodoCardProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const setUpdater = useSetRecoilState(todoUpdaterAtom);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedTodos = await TodoApi.getServiceTodos(teamId, serviceId);
      setTodos(fetchedTodos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId, serviceId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      const newTodo: Omit<Todo, "id"> = {
        teamId,
        title: trimmedTitle,
        completed: false,
        completedAt: null,
        completedBy: null,
        assigneeIds: [],
        serviceId,
        serviceTitle,
        serviceDate,
        dueDate: null,
        createdBy: currentUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        order: todos.length,
      };

      const newId = await TodoApi.createTodo(teamId, newTodo);

      setTodos((prev) => [...prev, { ...newTodo, id: newId }]);
      setUpdater(prev => prev + 1);
      setNewTitle("");
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const newCompleted = !todo.completed;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id
          ? {
              ...t,
              completed: newCompleted,
              completedAt: newCompleted ? Timestamp.now() : null,
              completedBy: newCompleted ? currentUserId : null,
            }
          : t
      )
    );

    try {
      await TodoApi.toggleTodo(teamId, todo.id, newCompleted, currentUserId);
      setUpdater(prev => prev + 1);
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id
            ? {
                ...t,
                completed: todo.completed,
                completedAt: todo.completedAt,
                completedBy: todo.completedBy,
              }
            : t
        )
      );
    }
  };

  const handleDelete = async (todoId: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== todoId));

    try {
      await TodoApi.deleteTodo(teamId, todoId);
      setUpdater(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      await fetchTodos();
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.order - b.order;
  });

  const incompleteTodosCount = todos.filter((t) => !t.completed).length;

  return (
    <div data-testid="service-todo-card">
      <SectionCardContainer>
        <SectionHeader
          icon={CircleCheck}
          iconColorClassName="bg-emerald-500/10 text-emerald-500"
          title="Todos"
          badge={incompleteTodosCount > 0 ? `${incompleteTodosCount}` : undefined}
        />
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 transition-all focus-within:border-primary/30">
          <Plus className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === "Enter" && newTitle.trim()) {
                handleAdd();
              }
            }}
            placeholder="Add a todo..."
            className="border-0 shadow-none px-0 h-9 text-sm font-medium focus-visible:ring-0 placeholder:text-muted-foreground/40"
          />
          {newTitle.trim() && (
            <button
              onClick={handleAdd}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {sortedTodos.length > 0 && (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {sortedTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <button
                    onClick={() => handleToggle(todo)}
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all active:scale-90",
                      todo.completed
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30 hover:border-primary/50"
                    )}
                  >
                    {todo.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>

                  <span
                    className={cn(
                      "flex-1 text-sm font-semibold leading-snug tracking-tight",
                      todo.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {todo.title}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-xl border-0">
                      <DropdownMenuItem
                        className="rounded-xl py-2.5 px-3 cursor-pointer font-semibold text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                        onSelect={() => handleDelete(todo.id)}
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {sortedTodos.length === 0 && !loading && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground/60">No todos yet</p>
          </div>
        )}
      </SectionCardContainer>
    </div>
  );
}
