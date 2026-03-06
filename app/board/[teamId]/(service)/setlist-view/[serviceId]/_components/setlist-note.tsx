import * as React from "react";
import { useRecoilValue } from "recoil";
import { setlistLiveOptionsAtom, setlistNoteAtom } from "../_states/setlist-view-states";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";

interface Props {
    constraintsRef?: React.RefObject<Element>
}

const STORAGE_KEY = "setlist-note-position";

export function SetlistNote({ constraintsRef }: Props) {
    const menu = useRecoilValue(setlistLiveOptionsAtom)
    const description = useRecoilValue(setlistNoteAtom)

    const [savedPosition, setSavedPosition] = React.useState<{ x: number; y: number } | null>(null);

    const motionX = useMotionValue(0);
    const motionY = useMotionValue(0);

    React.useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const position = JSON.parse(stored);
            setSavedPosition(position);
            motionX.set(position.x);
            motionY.set(position.y);
        }
    }, [motionX, motionY]);

    const handleDragEnd = (_: any, info: any) => {
        const newPosition = {
            x: info.offset.x,
            y: info.offset.y
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
        setSavedPosition(newPosition);
    };

    return (
        <AnimatePresence>
            {menu.showSongNote && description && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, y: -20, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: -20, x: "-50%" }}
                    transition={{ duration: 0.3 }}
                    style={{
                        x: motionX,
                        y: motionY
                    }}
                    className="fixed top-20 left-1/2 max-w-lg w-full z-20 mx-auto cursor-grab"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="rounded-xl font-bold px-4 py-1 text-popover-foreground text-center text-sm font-serif leading-relaxed select-none flex flex-col items-center"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.92)",
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            borderWidth: "1px",
                            boxShadow: "0 1px 3px 0px rgba(0, 0, 0, 0.4)"
                        }}
                    >
                        <div className="w-8 h-1 bg-zinc-400/80 rounded-full mb-1" />
                        {description}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
