"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PlanCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    /** Order number to display in the top-left corner badge */
    order?: number;
    /** Drag handle element to render below the order badge */
    dragHandle?: React.ReactNode;
    /** Function to call when delete button is clicked */
    onRemove?: () => void;
}

export function PlanCard({
    children,
    className,
    onClick,
    order,
    dragHandle,
    onRemove
}: PlanCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col w-full border shadow-sm rounded-3xl p-6 bg-white transition-all",
                onClick && "cursor-pointer hover:border-blue-200 hover:shadow-md",
                className
            )}
        >
            {/* Order Number Badge - Top Left Corner */}
            {order !== undefined && (
                <div className="absolute top-0 left-0 w-12 h-12 bg-gray-100/80 rounded-tl-3xl rounded-br-2xl flex items-center justify-center z-10 transition-colors group-hover:bg-gray-100">
                    <span className="text-gray-500 font-bold text-sm select-none">{order}</span>
                </div>
            )}

            {/* Drag Handle - Positioned below badge if order exists, otherwise top-left default */}
            {dragHandle && (
                <div className={cn(
                    "absolute z-10 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors",
                    order !== undefined
                        ? "left-3 top-16"
                        : "left-6 top-6" // Default position if no badge
                )}>
                    {dragHandle}
                </div>
            )}

            {/* Delete Button - Top Right */}
            {onRemove && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            )}

            {children}
        </div>
    );
}
