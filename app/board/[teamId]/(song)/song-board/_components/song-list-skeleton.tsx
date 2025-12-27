import { Skeleton } from "@/components/ui/skeleton";

export function SongListSkeleton() {
    return (
        <div className="flex flex-col h-full w-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 content-container-safe-area relative space-y-3">

                {/* Header Row Skeleton */}
                <div className="hidden md:flex items-center px-6 py-2 mb-2">
                    <div className="flex-1 pl-4"><Skeleton className="h-4 w-20 bg-muted/60" /></div>
                    <div className="w-32 shrink-0 text-center"><Skeleton className="h-4 w-12 mx-auto bg-muted/60" /></div>
                </div>

                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SongRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function SongRowSkeleton() {
    return (
        <div className="relative rounded-xl bg-card border border-border shadow-sm flex items-center h-[72px] sm:h-[100px] p-3 sm:p-5">
            {/* Left Column Skeleton */}
            <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-3 h-full px-1">
                {/* Title + Subtitle */}
                <div className="flex items-center gap-3">
                    <div className="h-5 sm:h-6 bg-muted rounded-md w-1/3 animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-muted/60 rounded-md w-1/6 animate-pulse"></div>
                </div>
                {/* Author or extra info */}
                <div className="h-3 sm:h-4 bg-muted/50 rounded-md w-1/4 animate-pulse"></div>
            </div>

            {/* Right Column Skeleton (Key/Actions) */}
            <div className="w-10 sm:w-16 flex justify-center items-center shrink-0 border-l border-border/50 pl-2 sm:pl-4 h-3/5">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-muted/50 rounded-lg animate-pulse"></div>
            </div>
        </div>
    )
}
