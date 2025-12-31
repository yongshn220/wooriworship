"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ServingFormSkeleton() {
    return (
        <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col overflow-hidden">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-50 w-full px-6 pt-8 pb-4 flex items-center justify-between pointer-events-none">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex gap-1">
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                </div>
                <div className="w-10" />
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">
                <div className="space-y-4 text-center flex flex-col items-center">
                    <Skeleton className="h-4 w-16 bg-gray-200" />
                    <Skeleton className="h-8 w-48 bg-gray-200" />
                </div>
                <Skeleton className="w-full h-[300px] rounded-3xl bg-gray-200" />
            </div>

            {/* Footer Skeleton */}
            <div className="sticky bottom-0 z-50 w-full px-6 pb-8 pt-4 pointer-events-none">
                <div className="flex gap-3 w-full max-w-2xl mx-auto pointer-events-auto">
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                    <Skeleton className="h-12 flex-1 rounded-full bg-gray-200" />
                </div>
            </div>
        </div>
    )
}
