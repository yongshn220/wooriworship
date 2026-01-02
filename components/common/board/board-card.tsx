"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronUp } from "lucide-react";

interface BoardCardProps {
    children: React.ReactNode;
    isExpanded: boolean;
    onClick?: () => void;
    className?: string;
    showCollapseButton?: boolean;
    onCollapse?: (e: React.MouseEvent) => void;
}

export function BoardCard({
    children,
    isExpanded,
    onClick,
    className,
    showCollapseButton = true,
    onCollapse
}: BoardCardProps) {
    return (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-300 border cursor-pointer bg-card",
                // Collapsed: very subtle border to blend in, light shadow
                // Expanded: subtle blue border, deeper shadow but clean
                isExpanded ? "border-blue-200 shadow-xl" : "border-transparent shadow-sm hover:border-border/50",
                // Hover: gentle lift
                "hover:-translate-y-[2px]",
                className
            )}
            onClick={onClick}
        >
            {children}

            {/* Collapse Bar (Footer) */}
            {isExpanded && showCollapseButton && (
                <div
                    className="flex items-center justify-center py-2 bg-muted/10 border-t border-border/60 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={onCollapse}
                >
                    <ChevronUp className="h-5 w-5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                </div>
            )}
        </Card>
    );
}
