import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200", className)} // Using bg-gray-200 as generic placeholder if muted is not defined
            {...props}
        />
    )
}

export { Skeleton }
