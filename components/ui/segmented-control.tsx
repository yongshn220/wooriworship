import * as React from "react"
import { cn } from "@/lib/utils"

interface SegmentedControlProps {
    value: string
    options: {
        label: string
        value: string
    }[]
    onChange: (value: any) => void
    classname?: string
}

export function SegmentedControl({
    value,
    options,
    onChange,
    classname
}: SegmentedControlProps) {
    return (
        <div className={cn("grid p-1 bg-secondary rounded-lg w-full", classname)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                        value === option.value
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
