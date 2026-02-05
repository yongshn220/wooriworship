"use client"

import { Dialog, DialogContentNoCloseButton, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SetlistLiveCarousel } from "./_components/setlist-live-carousel";
import { SetlistControlDock } from "./_components/setlist-control-dock";
import { SetlistIndexIndicator } from "./_components/setlist-index-indicator";
import { SetlistNote } from "./_components/setlist-note";
import { AnnotationToolbar } from "./_components/annotation-toolbar";

import { useRef } from "react";
import * as React from "react";

export default function SetlistViewPage({ params }: any) {
    const teamId = params.teamId
    const serviceId = params.serviceId
    const containerRef = useRef<HTMLDivElement>(null)

    function handleOpenChange(isOpen: boolean) {
        // Prevent implicit closing (Esc, Background click) to avoid accidental exits during mode switches
        // Users must use the "Exit" button in the menu
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
                    <DialogTitle>Setlist Live Page</DialogTitle>
                </VisuallyHidden>

                <div
                    ref={containerRef}
                    className="relative w-full h-full bg-background overflow-hidden touch-none"
                >
                    <SetlistLiveCarousel teamId={teamId} serviceId={serviceId} />

                    <SetlistNote constraintsRef={containerRef} />

                    <AnnotationToolbar />

                    <SetlistControlDock teamId={teamId} serviceId={serviceId} />

                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
                        <SetlistIndexIndicator />
                    </div>
                </div>
            </DialogContentNoCloseButton>
        </Dialog>
    )
}
