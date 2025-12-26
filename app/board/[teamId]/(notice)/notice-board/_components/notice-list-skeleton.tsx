import { Skeleton } from "@/components/ui/skeleton";

export function NoticeListSkeleton() {
    return (
        <div className="w-full h-full flex justify-center">
            <div className="w-full items-center">
                <div className="w-full flex-start flex-col gap-4">
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
        <div className="w-full p-4 border border-border rounded-lg bg-card relative animate-pulse flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-3/4 h-6 rounded" />
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-full h-4 rounded" />
                <Skeleton className="w-2/3 h-4 rounded" />
            </div>
            <Skeleton className="w-24 h-4 rounded mt-2" />
        </div>
    );
}
