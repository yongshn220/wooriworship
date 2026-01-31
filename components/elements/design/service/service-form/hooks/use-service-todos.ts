import { useState, useEffect, useRef } from "react";
import { TodoApi } from "@/apis/TodoApi";
import { Todo } from "@/models/todo";
import { FormMode } from "@/components/constants/enums";
interface TodoFormItem {
    id: string;  // local temp ID for new items, real ID for existing
    title: string;
    completed: boolean;
    assigneeIds: string[];
    order: number;
    isNew?: boolean;  // true if created in form (not yet in Firestore)
}

export function useServiceTodos(teamId: string, mode: string, serviceId?: string) {
    const [todos, setTodos] = useState<TodoFormItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const isInitialLoadDone = useRef(false);
    const originalTodosRef = useRef<TodoFormItem[]>([]);

    // Load existing todos in EDIT mode
    useEffect(() => {
        if (mode === FormMode.EDIT && serviceId && !isInitialLoadDone.current) {
            TodoApi.getServiceTodos(teamId, serviceId).then(existingTodos => {
                const mapped = existingTodos.map(t => ({
                    id: t.id,
                    title: t.title,
                    completed: t.completed,
                    assigneeIds: t.assigneeIds,
                    order: t.order,
                    isNew: false,
                }));
                setTodos(mapped);
                originalTodosRef.current = mapped;
                setIsLoaded(true);
                isInitialLoadDone.current = true;
            });
        } else if (mode === FormMode.CREATE) {
            setIsLoaded(true);
        }
    }, [teamId, mode, serviceId]);

    const addTodo = (title: string) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        setTodos(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            title: trimmed,
            completed: false,
            assigneeIds: [],
            order: prev.length,
            isNew: true,
        }]);
    };

    const removeTodo = (id: string) => {
        setTodos(prev => prev.filter(t => t.id !== id).map((t, i) => ({ ...t, order: i })));
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const updateTodo = (id: string, data: Partial<TodoFormItem>) => {
        setTodos(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    };

    return {
        todos,
        setTodos,
        isLoaded,
        originalTodosRef,
        addTodo,
        removeTodo,
        toggleTodo,
        updateTodo,
    };
}

export type { TodoFormItem };
