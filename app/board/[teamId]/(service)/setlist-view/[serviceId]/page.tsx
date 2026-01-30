"use client"

import { Dialog, DialogContentNoCloseButton, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { WorshipLiveCarousel } from "./_components/worship-live-carousel";
import { WorshipControlDock } from "./_components/worship-control-dock";
import { WorshipIndexIndicator } from "./_components/worship-index-indicator";
import { WorshipNote } from "./_components/worship-note";

import { useRef } from "react";
import * as React from "react";

export default function SetlistViewPage({ params }: any) {
    const teamId = params.teamId
    const serviceId = params.serviceId
    const containerRef = useRef<HTMLDivElement>(null)

    function handleOpenChange(isOpen: boolean) {
        // Prevent implicit closing (Esc, Background click) to avoid accidental exits during mode switches
        // Users must use the "Exit Worship" button in the menu
    }

    return (
        <Dialog open={true} onOpenChange={handleOpenChange}>
            <DialogContentNoCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onFocusOutside={(e) => e.preventDefault()}
                className="flex-center w-full max-w-8xl h-full p-0 bg-transparent border-none shadow-none focus:outline-none ring-0 outline-none"
            >
                <VisuallyHidden>
                    <DialogTitle>Worship Live Page</DialogTitle>
                </VisuallyHidden>

                <div
                    ref={containerRef}
                    className="relative w-full h-full bg-background overflow-hidden touch-none"
                >
                    <WorshipLiveCarousel teamId={teamId} serviceId={serviceId} />

                    <WorshipNote constraintsRef={containerRef} />

                    <WorshipControlDock teamId={teamId} serviceId={serviceId} />

                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
                        <WorshipIndexIndicator />
                    </div>
                </div>
            </DialogContentNoCloseButton>
        </Dialog>
    )
}
