import { Skeleton } from "@/components/ui/skeleton";

export function SongListSkeleton() {
    return (
        <div className="flex flex-col h-full w-full relative">
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 content-container-safe-area relative">
                <div className="max-w-[512px] md:max-w-[896px] mx-auto w-full">
                    <div className="flex flex-col divide-y divide-border">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <SongRowSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SongRowSkeleton() {
    return (
        <div className="relative min-h-[80px] p-3 sm:p-5 flex items-center">
            {/* Main Content Column */}
            <div className="flex-1 flex flex-col justify-center gap-2 px-1">

                {/* Row 1: Title + Subtitle */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 sm:h-6 w-1/3 bg-muted" />
                    <Skeleton className="h-4 sm:h-5 w-1/6 bg-muted/60" />
                </div>

                {/* Row 2: Author */}
                <Skeleton className="h-3 sm:h-4 w-1/4 bg-muted/50" />

                {/* Row 3: Keys */}
                <div className="flex gap-1.5 mt-1">
                    <Skeleton className="h-5 w-8 rounded bg-muted/50" />
                    <Skeleton className="h-5 w-8 rounded bg-muted/50" />
                </div>
            </div>
        </div>
    )
}
