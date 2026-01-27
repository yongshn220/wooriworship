"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateCardProps {
    icon?: LucideIcon;
    message: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function EmptyStateCard({ icon: Icon, message, description, className, children }: EmptyStateCardProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/20", className)}>
            {Icon && (
                <div className="p-3 mb-4 rounded-full bg-muted/40 text-muted-foreground">
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <h3 className="text-sm font-medium text-foreground">{message}</h3>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
            )}
            {children && (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </div>
    );
}
