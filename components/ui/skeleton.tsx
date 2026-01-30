import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)} // Using bg-muted as generic placeholder
            {...props}
        />
    )
}

export { Skeleton }
