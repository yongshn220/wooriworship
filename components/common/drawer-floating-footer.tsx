"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DrawerFloatingFooterProps {
    children?: ReactNode;
    className?: string;
    hidden?: boolean;
}

/**
 * A floating footer for drawers with gradient background.
 * Use with DrawerDoneButton for consistent styling.
 */
export function DrawerFloatingFooter({ children, className, hidden }: DrawerFloatingFooterProps) {
    return (
        <div
            className={cn(
                "absolute bottom-0 left-0 right-0 p-6 pt-10 pb-8 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none transition-all duration-200",
                hidden && "translate-y-full opacity-0",
                className
            )}
        >
            <div className="flex gap-3 max-w-md mx-auto pointer-events-auto">
                {children}
            </div>
        </div>
    );
}

interface DrawerDoneButtonProps {
    onClick?: () => void;
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

/**
 * Standard Done button for drawer footers.
 * Follows the setlist selection button style.
 */
export function DrawerDoneButton({
    onClick,
    children = "Done",
    className,
}: DrawerDoneButtonProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "h-14 flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl transition-all active:scale-95",
                className
            )}
        >
            {children}
        </Button>
    );
}
