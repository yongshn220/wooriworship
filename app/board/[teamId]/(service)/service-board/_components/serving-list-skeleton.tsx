import { Skeleton } from "@/components/ui/skeleton";

export function ServingListSkeleton() {
    return (
        <div className="flex flex-col h-full bg-muted/30 relative">
            <div className="flex-1 overflow-y-auto p-4 content-container-safe-area pb-24 space-y-8 overscroll-y-none">
                <section className="space-y-4">
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                <div className="p-4 sm:p-6">
                                    {/* Header Skeleton */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-2 w-full">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                            </div>
                                            <Skeleton className="h-8 w-3/4 sm:w-1/2" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Skeleton className="h-8 w-8 rounded-md" />
                                        </div>
                                    </div>

                                    {/* Content Skeleton */}
                                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                                        <div className="space-y-3">
                                            {[1, 2].map((j) => (
                                                <div key={j} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-9 w-20 rounded-full" />
                                                        <div className="flex -space-x-2">
                                                            <Skeleton className="h-8 w-8 rounded-full border-2 border-background" />
                                                            <Skeleton className="h-8 w-8 rounded-full border-2 border-background" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
