"use client";

import React from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModernDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    cancelText?: string;
    actionText?: string;
    onAction?: () => void | Promise<void>;
    variant?: "default" | "destructive" | "primary";
    isLoading?: boolean;
    children?: React.ReactNode;
}

export function ModernDialog({
    open,
    onOpenChange,
    title,
    description,
    icon,
    cancelText = "Cancel",
    actionText = "Confirm",
    onAction,
    variant = "primary",
    isLoading = false,
    children
}: ModernDialogProps) {

    // Custom button styles based on variant
    const getActionButtonStyle = () => {
        switch (variant) {
            case "destructive":
                return "bg-card border-2 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive shadow-sm";
            case "primary":
                return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm";
            default:
                return "";
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="w-[90%] max-w-[400px] rounded-[32px] p-8 gap-6 sm:rounded-[32px] border-none shadow-xl bg-card">
                <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
                    {/* Icon Area */}
                    {icon && (
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                            variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                        )}>
                            {icon}
                        </div>
                    )}

                    <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
                        {title}
                    </AlertDialogTitle>

                    {description && (
                        <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed max-w-[280px]">
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>

                {children}

                <div className="flex gap-3 w-full mt-2">
                    <Button
                        data-testid="dialog-cancel"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-2xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 hover:text-foreground"
                    >
                        {cancelText}
                    </Button>

                    {onAction && (
                        <Button
                            data-testid="dialog-confirm"
                            onClick={async (e) => {
                                e.preventDefault();
                                if (onAction) await onAction();
                            }}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 h-12 rounded-2xl font-bold transition-all",
                                getActionButtonStyle()
                            )}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Processing...
                                </span>
                            ) : actionText}
                        </Button>
                    )}
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
