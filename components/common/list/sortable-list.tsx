"use client";

import React, { ReactNode } from "react";
import { Reorder, useDragControls, DragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// --- 1. SortableList (Container) ---
interface SortableListProps<T> {
    items: T[];
    onReorder: (newOrder: T[]) => void;
    className?: string;
    children: ReactNode;
    axis?: "y" | "x";
}

export function SortableList<T>({ items, onReorder, className, children, axis = "y" }: SortableListProps<T>) {
    return (
        <Reorder.Group
            axis={axis}
            values={items}
            onReorder={onReorder}
            className={cn("flex flex-col gap-4", className)}
        >
            {children}
        </Reorder.Group>
    );
}

// --- 2. SortableItem (Wrapper) ---
interface SortableItemProps<T> {
    value: T;
    className?: string;
    children: ReactNode | ((controls: DragControls) => ReactNode);
}

export function SortableItem<T>({ value, className, children }: SortableItemProps<T>) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={value}
            dragListener={false}
            dragControls={controls}
            className={cn("relative", className)}
        >
            {typeof children === "function" ? children(controls) : children}
        </Reorder.Item>
    );
}

// --- 3. SortableDragHandle (UI) ---
interface SortableDragHandleProps {
    controls?: DragControls;
    className?: string;
    children?: ReactNode; // Optional custom icon
}

export function SortableDragHandle({ controls, className, children }: SortableDragHandleProps) {
    if (!controls) {
        console.warn("SortableDragHandle requires 'controls' prop to function.");
        return null;
    }

    return (
        <div
            className={cn(
                "cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-lg transition-colors touch-none p-2 flex items-center justify-center",
                className
            )}
            onPointerDown={(e) => controls.start(e)}
        >
            {children || <GripVertical className="h-5 w-5" />}
        </div>
    );
}
