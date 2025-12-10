import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface Props {
    children: ReactNode
    title?: string
    className?: string
}

export function MenuGroup({ children, title, className }: Props) {
    return (
        <div className={cn("mb-6", className)}>
            {title && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-4">
                    {title}
                </h3>
            )}
            <div className="bg-white rounded-xl border shadow-sm divide-y overflow-hidden">
                {children}
            </div>
        </div>
    )
}
