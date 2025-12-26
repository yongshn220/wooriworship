import { Skeleton } from "@/components/ui/skeleton";

export function SongListSkeleton() {
    return (
        <div className="w-full h-full p-2 sm:p-4 md:p-6 relative space-y-2">

            {/* Header Row Skeleton */}
            <div className="hidden md:flex items-center px-6 py-2 mb-2">
                <div className="flex-1 pl-4"><Skeleton className="h-4 w-20" /></div>
                <div className="w-32 shrink-0 text-center"><Skeleton className="h-4 w-12 mx-auto" /></div>
            </div>

            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="relative rounded-xl bg-card border border-border shadow-sm flex items-center h-[64px] sm:h-[100px] p-1 sm:p-5">
                    {/* Left Column Skeleton */}
                    <div className="flex-1 flex flex-col justify-between h-full py-0.5 sm:py-1 px-1">
                        {/* Title + Subtitle */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 sm:h-5 w-1/3 rounded" />
                            <Skeleton className="h-2.5 sm:h-3 w-1/5 rounded" />
                        </div>
                        {/* Author */}
                        <Skeleton className="h-2.5 sm:h-3 w-1/3 rounded" />
                        {/* Key */}
                        <Skeleton className="h-3.5 sm:h-4 w-8 rounded mt-auto" />
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="w-5 sm:w-10 flex justify-center items-center shrink-0 border-l border-border pl-0.5 sm:pl-3 h-2/3">
                        <Skeleton className="h-4 w-4 sm:h-6 sm:w-6 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Export specific row skeleton if needed (SongList has it locally, but we can standardise if desired)
export function SongRowSkeleton() {
    return (
        <div className="relative rounded-xl bg-card border border-border shadow-sm flex items-center h-[64px] sm:h-[100px] p-1 sm:p-5">
            {/* Left Column Skeleton */}
            <div className="flex-1 flex flex-col justify-between h-full py-0.5 sm:py-1 px-1">
                {/* Title + Subtitle */}
                <div className="flex items-center gap-2">
                    <div className="h-4 sm:h-5 bg-muted rounded w-1/3 animate-pulse"></div>
                    <div className="h-2.5 sm:h-3 bg-muted rounded w-1/5 animate-pulse"></div>
                </div>
                {/* Author */}
                <div className="h-2.5 sm:h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                {/* Key */}
                <div className="h-3.5 sm:h-4 w-8 bg-muted rounded animate-pulse mt-auto"></div>
            </div>

            {/* Right Column Skeleton */}
            <div className="w-5 sm:w-10 flex justify-center items-center shrink-0 border-l border-border pl-0.5 sm:pl-3 h-2/3">
                <div className="h-4 w-4 sm:h-6 sm:w-6 bg-muted rounded animate-pulse"></div>
            </div>
        </div>
    )
}
