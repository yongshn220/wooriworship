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
import { AnimatePresence, motion } from "framer-motion";
import { useRecoilState } from "recoil";
import { worshipUIVisibilityAtom } from "./_states/worship-detail-states";

export default function WorshipLivePage({ params }: any) {
    const teamId = params.teamId
    const worshipId = params.worshipId
    const router = useRouter()
    const [uiVisible, setUiVisible] = useRecoilState(worshipUIVisibilityAtom)
    const containerRef = useRef(null)

    function handleOpenChange(isOpen: boolean) {
        if (!isOpen) {
            router.replace(getPathPlan(teamId) + `?expanded=${worshipId}`)
        }
    }

    function toggleUI() {
        setUiVisible(!uiVisible)
    }

    return (
        <Dialog open={true} onOpenChange={handleOpenChange}>
            <DialogContentNoCloseButton className="flex-center w-full max-w-8xl h-full p-0 bg-transparent border-none shadow-none focus:outline-none ring-0 outline-none">
                <VisuallyHidden>
                    <DialogTitle>Worship Live Page</DialogTitle>
                </VisuallyHidden>

                <div ref={containerRef} className="relative w-full h-full bg-white dark:bg-black overflow-hidden" onClick={toggleUI}>
                    <WorshipLiveCarousel worshipId={worshipId} />

                    <WorshipNote constraintsRef={containerRef} />

                    <AnimatePresence>
                        {uiVisible && (
                            <>
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    // Stop propagation on Dock so clicking buttons doesn't toggle UI
                                    className="absolute bottom-0 w-full flex justify-center z-50 pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <WorshipControlDock teamId={teamId} worshipId={worshipId} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="pointer-events-none"
                                >
                                    <WorshipIndexIndicator />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContentNoCloseButton>
        </Dialog>
    )
}
