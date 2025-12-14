"use client"

import { Dialog, DialogContentNoCloseButton, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { getPathPlan } from "@/components/util/helper/routes";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    WorshipLiveCarousel
} from "./_components/worship-live-carousel";
import {
    WorshipControlDock
} from "./_components/worship-control-dock";
import {
    WorshipIndexIndicator
} from "./_components/worship-index-indicator";
import { WorshipNote } from "./_components/worship-note";


import { useRef } from "react";
import * as React from "react";

export default function WorshipLivePage({ params }: any) {
    const teamId = params.teamId
    const worshipId = params.worshipId
    const router = useRouter()
    // const [uiVisible, setUiVisible] = useRecoilState(worshipUIVisibilityAtom) // Unused in page now
    const containerRef = useRef<HTMLDivElement>(null)

    function handleOpenChange(isOpen: boolean) {
        // Prevent implicit closing (Esc, Background click) to avoid accidental exits during mode switches
        // Users must use the "Exit Worship" button in the menu
        if (!isOpen) {
            // router.replace(getPathPlan(teamId) + `?expanded=${worshipId}`)
        }
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
                    className="relative w-full h-full bg-background overflow-hidden touch-none" // touch-none to prevent browser zooming/scrolling interfering
                >
                    <WorshipLiveCarousel worshipId={worshipId} />

                    <WorshipNote constraintsRef={containerRef} />

                    {/* Dock - Always rendered, just hidden visually to prevent layout shift */}
                    {/* Dock - Always rendered, control logic inside */}
                    <WorshipControlDock teamId={teamId} worshipId={worshipId} />

                    {/* Indicator - Always rendered */}
                    {/* Indicator - Always rendered, visible based on its own toggle */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
                        <WorshipIndexIndicator />
                    </div>
                </div>
            </DialogContentNoCloseButton>
        </Dialog>
    )
}
