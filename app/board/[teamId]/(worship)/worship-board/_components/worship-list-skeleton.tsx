import { Skeleton } from "@/components/ui/skeleton";

export function WorshipListSkeleton() {
    return (
        <div className="w-full h-full">
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 grid-flow-row-dense grid-rows-[auto]">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-[400px] border rounded-lg p-4 space-y-4 bg-card animate-pulse">
                        <div className="w-2/3 h-6 bg-muted rounded"></div>
                        <div className="w-1/2 h-4 bg-muted rounded"></div>
                        <div className="w-full h-40 bg-muted/50 rounded-md"></div>
                        <div className="space-y-2">
                            <div className="w-full h-4 bg-muted rounded"></div>
                            <div className="w-5/6 h-4 bg-muted rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Exporting single card skeleton if needed elsewhere, though ListSkeleton covers the full page load view
export function WorshipCardSkeleton() {
    return (
        <div className="w-full h-[400px] border rounded-lg p-4 space-y-4 bg-card animate-pulse">
            <div className="w-2/3 h-6 bg-muted rounded"></div>
            <div className="w-1/2 h-4 bg-muted rounded"></div>
            <div className="w-full h-40 bg-muted/50 rounded-md"></div>
            <div className="space-y-2">
                <div className="w-full h-4 bg-muted rounded"></div>
                <div className="w-5/6 h-4 bg-muted rounded"></div>
            </div>
        </div>
    )
}
