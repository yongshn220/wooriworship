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
import { AnimatePresence, motion } from "framer-motion";
import { useRecoilState } from "recoil";
import { worshipUIVisibilityAtom } from "./_states/worship-detail-states";
import { LongPressFeedback } from "./_components/long-press-feedback";

export default function WorshipLivePage({ params }: any) {
    const teamId = params.teamId
    const worshipId = params.worshipId
    const router = useRouter()
    const [uiVisible, setUiVisible] = useRecoilState(worshipUIVisibilityAtom)
    const containerRef = useRef<HTMLDivElement>(null)

    // Long Press Logic
    const [isPressing, setIsPressing] = React.useState(false)
    const [pressPos, setPressPos] = React.useState({ x: 0, y: 0 })
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    function handleOpenChange(isOpen: boolean) {
        // Prevent implicit closing (Esc, Background click) to avoid accidental exits during mode switches
        // Users must use the "Exit Worship" button in the menu
        if (!isOpen) {
            // router.replace(getPathPlan(teamId) + `?expanded=${worshipId}`)
        }
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        if (uiVisible) return; // Only trigger long press if UI is hidden

        setIsPressing(true)
        setPressPos({ x: e.clientX, y: e.clientY })

        timerRef.current = setTimeout(() => {
            setUiVisible(true)
            setIsPressing(false)
        }, 1000)
    }

    const handlePointerUp = () => {
        cancelLongPress()
    }

    const handlePointerLeave = () => {
        cancelLongPress()
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isPressing) {
            // Optional: Cancel if moved too much? For now, simplistic.
        }
    }

    function cancelLongPress() {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        setIsPressing(false)
    }

    const uiVariants = {
        visible: { opacity: 1, y: 0, pointerEvents: "auto" as const },
        hidden: { opacity: 0, y: 100, pointerEvents: "none" as const }
    }

    const indicatorVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 }
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
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    onPointerMove={handlePointerMove}
                >
                    <WorshipLiveCarousel worshipId={worshipId} />

                    <WorshipNote constraintsRef={containerRef} />

                    <LongPressFeedback isPressing={isPressing} x={pressPos.x} y={pressPos.y} />

                    {/* Dock - Always rendered, just hidden visually to prevent layout shift */}
                    <motion.div
                        variants={uiVariants}
                        initial="visible"
                        animate={uiVisible ? "visible" : "hidden"}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 w-full flex justify-center z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <WorshipControlDock teamId={teamId} worshipId={worshipId} />
                    </motion.div>

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
