import { Skeleton } from "@/components/ui/skeleton";

export function WorshipListSkeleton() {
    return (
        <div className="flex flex-col h-full w-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 content-container-safe-area pb-24 space-y-4 overscroll-y-none">
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="w-full border rounded-xl p-5 bg-card shadow-sm flex flex-col gap-5">
                            {/* Card Header: Date & Title */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-3 w-3/4">
                                    <Skeleton className="w-24 h-5 rounded-full bg-muted" /> {/* Date badge-like */}
                                    <Skeleton className="w-full sm:w-2/3 h-7 rounded-md bg-muted-foreground/20" /> {/* Title */}
                                </div>
                                <Skeleton className="w-8 h-8 rounded-full bg-muted" /> {/* Menu icon */}
                            </div>

                            {/* Card Content: Mock Setlist Items */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-md bg-muted/50" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="w-3/4 h-4 rounded-md bg-muted/60" />
                                        <Skeleton className="w-1/2 h-3 rounded-md bg-muted/40" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-md bg-muted/50" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="w-2/3 h-4 rounded-md bg-muted/60" />
                                        <Skeleton className="w-1/3 h-3 rounded-md bg-muted/40" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-md bg-muted/50" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="w-1/2 h-4 rounded-md bg-muted/60" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Team Members or Extra Info */}
                            <div className="pt-4 border-t border-border/50 flex items-center gap-2">
                                <Skeleton className="w-7 h-7 rounded-full bg-muted" />
                                <Skeleton className="w-7 h-7 rounded-full bg-muted" />
                                <Skeleton className="w-7 h-7 rounded-full bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Exporting single card skeleton if needed elsewhere
export function WorshipCardSkeleton() {
    return (
        <div className="w-full border rounded-xl p-5 bg-card shadow-sm flex flex-col gap-5">
            <div className="flex justify-between items-start">
                <div className="space-y-3 w-3/4">
                    <Skeleton className="w-24 h-5 rounded-full bg-muted" />
                    <Skeleton className="w-full sm:w-2/3 h-7 rounded-md bg-muted/30" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full bg-muted" />
            </div>
            <div className="space-y-3 pt-2">
                {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-md bg-muted/50" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="w-3/4 h-4 rounded-md bg-muted/60" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-full bg-muted" />
                <Skeleton className="w-7 h-7 rounded-full bg-muted" />
                <Skeleton className="w-7 h-7 rounded-full bg-muted" />
            </div>
        </div>
    )
}
