import * as React from "react";
import { useRecoilValue } from "recoil";
import { worshipLiveOptionsAtom, worshipNoteAtom } from "../_states/worship-detail-states";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
    constraintsRef?: React.RefObject<Element>
}

export function WorshipNote({ constraintsRef }: Props) {
    const menu = useRecoilValue(worshipLiveOptionsAtom)
    const description = useRecoilValue(worshipNoteAtom)

    return (
        <AnimatePresence>
            {menu.showSongNote && description && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-20 left-1/2 max-w-lg w-full z-40 mx-auto cursor-grab"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-popover/80 backdrop-blur-md rounded-xl p-4 text-popover-foreground shadow-2xl border border-border/20 text-center text-sm font-serif leading-relaxed select-none flex flex-col items-center">
                        <div className="w-8 h-1 bg-zinc-400/80 rounded-full mb-1" />
                        {description}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
