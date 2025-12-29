"use client";

import React, { Suspense } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { WorshipCard } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-card";
import { WorshipCardSkeleton } from "@/app/board/[teamId]/(worship)/worship-board/_components/worship-list-skeleton";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    worshipId: string | null;
}

export function WorshipPlanPreviewDrawer({ isOpen, onClose, worshipId }: Props) {
    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="h-[85vh]">
                <DrawerHeader className="text-left border-b pb-4">
                    <DrawerTitle>Worship Plan Preview</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 overflow-y-auto no-scrollbar pb-10">
                    {worshipId && (
                        <Suspense fallback={<WorshipCardSkeleton />}>
                            <WorshipCard worshipId={worshipId} isFirst={true} />
                        </Suspense>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
