import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Root Container ---
export const FullScreenForm = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={cn("fixed inset-0 z-[100] bg-gray-50 flex flex-col", className)}>
            {children}
        </div>
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
    return (
        <div className={cn("absolute top-0 left-0 right-0 z-50 w-full px-6 pt-8 pb-12 flex items-center justify-between pointer-events-none bg-gradient-to-b from-gray-50 via-gray-50/90 to-transparent", className)}>
            {/* Exit Button */}
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-background/50 hover:bg-background shadow-sm pointer-events-auto backdrop-blur-sm" onClick={onClose}>
                <X className="w-5 h-5 text-muted-foreground" />
            </Button>

            {/* Step Bar */}
            <div className="flex gap-1 p-1 bg-white/50 backdrop-blur-md rounded-full shadow-sm pointer-events-auto absolute left-1/2 -translate-x-1/2">
                {steps.map((label, idx) => (
                    <button
                        key={idx}
                        onClick={() => onStepChange(idx)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                            currentStep === idx
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

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
export const FullScreenFormFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={cn("absolute bottom-0 left-0 right-0 z-50 w-full px-6 pb-8 pt-12 pointer-events-none bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent", className)}>
            <div className="flex gap-3 w-full max-w-2xl mx-auto pointer-events-auto">
                {children}
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
