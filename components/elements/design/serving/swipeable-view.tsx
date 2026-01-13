"use client";

import { motion, AnimatePresence, PanInfo, Variants } from "framer-motion";
import { ReactNode, useState } from "react";

interface SwipeableViewProps {
    children: ReactNode;
    /** Unique key for the content to trigger animations */
    viewId: string;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    /** Sensitivity of the swipe (minimum distance to trigger) */
    swipeConfidenceThreshold?: number;
    className?: string;
    /** Optional disabled state */
    disabled?: boolean;
}

const variants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%", // Slide in from Right if Next(1), from Left if Prev(-1)
        opacity: 0.5,
        zIndex: 0,
        scale: 0.95
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        position: "relative" // Ensure it takes up space when active
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? "100%" : "-100%", // Exit to Right if Prev(-1) clicked, Exit to Left if Next(1) clicked
        opacity: 0.5,
        scale: 0.95,
        position: "absolute", // Absolute position to allow overlap during exit
        top: 0,
        left: 0,
        width: "100%"
    })
};

export function SwipeableView({
    children,
    viewId,
    onSwipeLeft,
    onSwipeRight,
    swipeConfidenceThreshold = 10000,
    className,
    disabled = false
}: SwipeableViewProps) {
    // Direction state: 1 for right-to-left (next), -1 for left-to-right (prev)
    const [direction, setDirection] = useState(0);

    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
        if (disabled) return;

        const swipe = swipePower(offset.x, velocity.x);

        if (swipe < -swipeConfidenceThreshold) {
            // Swiped Left -> Next
            setDirection(1);
            onSwipeLeft?.();
        } else if (swipe > swipeConfidenceThreshold) {
            // Swiped Right -> Prev
            setDirection(-1);
            onSwipeRight?.();
        }
    };

    return (
        <div className={className} style={{ position: "relative", overflow: "hidden", touchAction: "pan-y" }}>
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                <motion.div
                    key={viewId}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        scale: { duration: 0.2 }
                    }}
                    drag={disabled ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="h-full w-full bg-surface dark:bg-surface-dark" // Ensure background is solid for covering
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
