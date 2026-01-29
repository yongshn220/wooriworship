"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateCardProps {
    icon?: LucideIcon;
    iconColorClassName?: string;
    message: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    "data-testid"?: string;
}

export function EmptyStateCard({
    icon: Icon,
    iconColorClassName,
    message,
    description,
    className,
    children,
    onClick,
    "data-testid": testId,
}: EmptyStateCardProps) {
    const content = (
        <>
            {Icon && (
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform",
                    iconColorClassName || "bg-muted/40 text-muted-foreground"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <h3 className="text-base font-semibold text-foreground">{message}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">{description}</p>
            )}
            {children && <div className="mt-4">{children}</div>}
        </>
    );

    return (
        <div
            onClick={onClick}
            className={cn(
                "group border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center text-center",
                onClick && "cursor-pointer hover:bg-muted/10 hover:border-muted-foreground/40 transition-all",
                className
            )}
            data-testid={testId}
        >
            {content}
        </div>
    );
}
