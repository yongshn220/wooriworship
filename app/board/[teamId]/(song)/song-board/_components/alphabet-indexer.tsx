"use client"

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { songAlphabetMapAtom } from "@/global-states/song-state";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
    teamId: string;
    onScrollRequest: (index: number) => void;
}

export function AlphabetIndexer({ teamId, onScrollRequest }: Props) {
    const alphabetMap = useRecoilValue(songAlphabetMapAtom(teamId));
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [activeDragChar, setActiveDragChar] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [bubbleY, setBubbleY] = useState<number | null>(null);

    // Order: # -> English -> Korean
    const chars = useMemo(() => {
        const korean = [
            'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        // English 'A' to 'Z'
        const english = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

        return ['#', ...english, ...korean];
    }, []);

    const clearScrollInterval = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const handleInteraction = (clientY: number) => {
        if (!containerRef.current) return;

        // Bubble Offset: Position bubble 40px ABOVE the finger
        setBubbleY(clientY - 40);

        // Auto-Scroll Logic
        const rect = containerRef.current.getBoundingClientRect();
        const EDGE_THRESHOLD = 40;
        const SCROLL_SPEED = 5;

        clearScrollInterval(); // Clear existing to prevent stacking

        // Scroll Down
        if (clientY > rect.bottom - EDGE_THRESHOLD) {
            scrollIntervalRef.current = setInterval(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop += SCROLL_SPEED;
                }
            }, 16);
        }
        // Scroll Up
        else if (clientY < rect.top + EDGE_THRESHOLD) {
            scrollIntervalRef.current = setInterval(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop -= SCROLL_SPEED;
                }
            }, 16);
        }

        // Find Element Logic
        const centerX = rect.left + rect.width / 2;
        const element = document.elementFromPoint(centerX, clientY);
        const button = element?.closest('button');

        if (button) {
            const char = button.getAttribute('data-char');
            if (char && alphabetMap[char] !== undefined) {
                if (activeDragChar !== char) {
                    setActiveDragChar(char);
                    onScrollRequest(alphabetMap[char]);

                    if (navigator.vibrate) {
                        navigator.vibrate(10);
                    }
                }
            }
        }
    };

    const onPointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        handleInteraction(e.clientY);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        handleInteraction(e.clientY);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        setActiveDragChar(null);
        setBubbleY(null);
        clearScrollInterval();
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    useEffect(() => {
        return () => clearScrollInterval();
    }, [])

    return (
        <>
            {/* Floating Bubble Indicator (Follows Finger) - Moved outside to escape transform context */}
            <AnimatePresence>
                {isDragging && activeDragChar && bubbleY !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: -45 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed right-2 w-14 h-14 bg-gray-900 shadow-2xl rounded-full rounded-br-none flex items-center justify-center z-50 pointer-events-none transform -translate-y-1/2 rotate-45"
                        style={{ top: bubbleY }}
                    >
                        <div className="transform -rotate-45 text-white text-2xl font-bold font-sans">
                            {activeDragChar}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed right-0 top-1/2 -translate-y-[50%] z-50 flex flex-col items-center pointer-events-auto touch-none select-none">
                {/* Index Bar */}
                <div
                    ref={containerRef}
                    className="flex flex-col gap-[2px] py-4 px-2 pr-1 w-12 sm:w-16 items-center max-h-[60vh] 
                     overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                >
                    {chars.map((char) => {
                        const isActive = alphabetMap[char] !== undefined;
                        const isHighlighted = activeDragChar === char;

                        return (
                            <button
                                key={char}
                                data-char={char}
                                type="button"
                                className={cn(
                                    "w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full transition-all duration-200 shrink-0",
                                    isActive
                                        ? "text-blue-500"
                                        : "text-gray-300",
                                    isHighlighted
                                        ? "scale-150 text-gray-900"
                                        : "opacity-80"
                                )}
                                onClick={(e) => e.preventDefault()}
                            >
                                {char === '#' ? '•' : char}
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    );
}
