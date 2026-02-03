"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    autoFocus?: boolean;
    className?: string;
    inputClassName?: string;
    size?: "sm" | "md" | "lg";
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
    (
        {
            value,
            onChange,
            placeholder = "Search...",
            onFocus,
            onBlur,
            autoFocus = false,
            className,
            inputClassName,
            size = "md",
        },
        ref
    ) => {
        const sizeStyles = {
            sm: "h-9",
            md: "h-11",
            lg: "h-12",
        };

        const iconSizeStyles = {
            sm: "h-4 w-4",
            md: "h-4 w-4",
            lg: "h-5 w-5",
        };

        const paddingStyles = {
            sm: "pl-9 pr-9",
            md: "pl-10 pr-10",
            lg: "pl-11 pr-11",
        };

        return (
            <div className={cn("relative w-full", className)}>
                <Search
                    className={cn(
                        "absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground/50 pointer-events-none",
                        iconSizeStyles[size]
                    )}
                />
                <Input
                    ref={ref}
                    className={cn(
                        "w-full bg-muted/50 border-0 rounded-full placeholder:text-muted-foreground/50 font-medium transition-all",
                        "ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/20",
                        sizeStyles[size],
                        paddingStyles[size],
                        inputClassName
                    )}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className={cn(
                            "absolute top-1/2 right-3 transform -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded-full p-0.5 hover:bg-muted"
                        )}
                        aria-label="Clear search"
                    >
                        <X className={iconSizeStyles[size]} />
                    </button>
                )}
            </div>
        );
    }
);

SearchBar.displayName = "SearchBar";
