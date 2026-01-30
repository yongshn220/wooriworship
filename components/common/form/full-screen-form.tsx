import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

// --- Root Container ---
export const FullScreenForm = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Lock body scroll
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        }
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className={cn("fixed inset-0 z-[9999] bg-background flex flex-col touchscreen-fix", className)}>
            {children}
        </div>,
        document.body
    );
};

// --- Header ---
interface FullScreenFormHeaderProps {
    steps: string[];
    currentStep: number;
    onStepChange: (step: number) => void;
    onClose: () => void;
    className?: string;
}

export const FullScreenFormHeader = ({ steps, currentStep, onStepChange, onClose, className }: FullScreenFormHeaderProps) => {
    const showStepBar = steps.length > 1;

    return (
        <div className={cn("absolute top-0 left-0 right-0 z-50 w-full px-6 pt-8 pb-12 flex items-center justify-between pointer-events-none bg-gradient-to-b from-background via-background/90 to-transparent", className)}>
            {/* Exit Button */}
            <Button data-testid="form-close" variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-background/50 hover:bg-background shadow-sm pointer-events-auto backdrop-blur-sm" onClick={onClose}>
                <X className="w-5 h-5 text-muted-foreground" />
            </Button>

            {/* Step Bar - Only show if multiple steps */}
            {showStepBar && (
                <div className="flex gap-1 p-1 bg-background/50 backdrop-blur-md rounded-full shadow-sm pointer-events-auto absolute top-8 left-1/2 -translate-x-1/2">
                    {steps.map((label, idx) => (
                        <button
                            key={idx}
                            onClick={() => onStepChange?.(idx)}
                            className={cn(
                                "px-3 py-1.5 min-h-touch rounded-full text-[10px] font-bold transition-all",
                                currentStep === idx
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                                !onStepChange && "cursor-not-allowed opacity-50"
                            )}
                            disabled={!onStepChange}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            <div className="w-10" /> {/* Spacer */}
        </div>
    );
};

// --- Body ---
// Using forwardRef to allow parent to control scrolling
export const FullScreenFormBody = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
    ({ children, className }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar pt-24", className)}
            >
                <main className="w-full max-w-2xl mx-auto px-6 pb-32 relative">
                    {children}
                </main>
            </div>
        );
    }
);
FullScreenFormBody.displayName = "FullScreenFormBody";

// --- Footer ---
export const FullScreenFormFooter = ({ children, className, errorMessage }: { children: React.ReactNode; className?: string; errorMessage?: string }) => {
    return (
        <div className={cn("absolute bottom-0 left-0 right-0 z-50 w-full px-6 pb-8 pt-12 pointer-events-none bg-gradient-to-t from-background via-background/90 to-transparent", className)}>
            <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto pointer-events-auto">
                {errorMessage && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-destructive text-[13px] font-bold text-center bg-destructive/5 py-2 px-4 rounded-full">
                            {errorMessage}
                        </p>
                    </div>
                )}
                <div className="flex gap-3 w-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Standard Card ---
export const FormSectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={cn("bg-card rounded-3xl shadow-xl shadow-foreground/5 border border-border/50 p-6 space-y-4", className)}>
            {children}
        </div>
    );
};
