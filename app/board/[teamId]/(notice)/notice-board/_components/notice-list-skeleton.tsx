import { Skeleton } from "@/components/ui/skeleton";

export function NoticeListSkeleton() {
    return (
        <div className="flex flex-col h-full w-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-4 content-container-safe-area pb-24 space-y-4">
                <div className="max-w-[512px] md:max-w-[896px] mx-auto w-full space-y-4">
                    {[1, 2, 3].map((i) => (
                        <NoticeItemSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function NoticeItemSkeleton() {
    return (
        <div className="w-full p-5 border border-border rounded-xl bg-card relative animate-pulse flex flex-col gap-5 shadow-sm">
            {/* Header: Date & Avatar */}
            <div className="flex justify-between items-center">
                <Skeleton className="w-32 h-5 rounded-md bg-muted/70" />
                <Skeleton className="w-9 h-9 rounded-full bg-muted" />
            </div>

            {/* Body Lines */}
            <div className="space-y-3">
                <Skeleton className="w-4/5 h-6 rounded-md bg-muted" /> {/* Title-ish line */}
                <div className="space-y-2 pt-1">
                    <Skeleton className="w-full h-4 rounded-md bg-muted/60" />
                    <Skeleton className="w-full h-4 rounded-md bg-muted/60" />
                    <Skeleton className="w-2/3 h-4 rounded-md bg-muted/60" />
                </div>
            </div>

            {/* Optional generic action/footer placeholder */}
            <Skeleton className="w-24 h-4 rounded-md mt-1 bg-muted/50" />
        </div>
    );
}
