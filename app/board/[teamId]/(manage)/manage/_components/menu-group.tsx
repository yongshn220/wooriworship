import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface Props {
    children: ReactNode
    title?: string
    className?: string
}

export function MenuGroup({ children, title, className }: Props) {
    return (
        <div className={cn("mb-5", className)}>
            {title && (
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 ml-1">
                    {title}
                </h3>
            )}
            <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border overflow-hidden">
                {children}
            </div>
        </div>
    )
}
