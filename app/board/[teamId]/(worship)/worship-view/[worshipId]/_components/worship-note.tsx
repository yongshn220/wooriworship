import * as React from "react";
import { useRecoilValue } from "recoil";
import { worshipLiveOptionsAtom, worshipNoteAtom } from "../_states/worship-detail-states";
import { AnimatePresence, motion } from "framer-motion";


export function WorshipNote() {
    const menu = useRecoilValue(worshipLiveOptionsAtom)
    const description = useRecoilValue(worshipNoteAtom)

    return (
        <AnimatePresence>
            {menu.showSongNote && description && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 max-w-lg w-full z-40 mx-auto pointer-events-none"
                >
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 text-white/90 shadow-xl border border-white/10 text-center text-sm font-serif leading-relaxed pointer-events-auto">
                        {description}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

