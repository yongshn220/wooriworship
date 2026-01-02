
import { Skeleton } from "@/components/ui/skeleton"

export function BoardSkeleton() {
    return (
        <div className="w-full h-full flex flex-col bg-muted/30">
            {/* Top Nav Skeleton */}
            <div className="h-14 w-full border-b bg-background flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 p-4 space-y-4 overflow-hidden">
                {/* Banner/Header area */}
                <Skeleton className="h-32 w-full rounded-xl" />

                {/* List items */}
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
