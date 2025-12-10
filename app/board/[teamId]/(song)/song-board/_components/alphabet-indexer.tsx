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
    const [activeDragChar, setActiveDragChar] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Order: # -> English -> Korean
    const chars = useMemo(() => {
        const korean = [
            'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        // English 'A' to 'Z'
        const english = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

        return ['#', ...english, ...korean];
    }, []);

    const handleInteraction = (clientY: number) => {
        if (!containerRef.current) return;

        // Find the element under the pointer
        // We use document.elementFromPoint to find the button
        // Note: We need the X coordinate of the container to be accurate
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        const element = document.elementFromPoint(centerX, clientY);
        const button = element?.closest('button');

        if (button) {
            const char = button.getAttribute('data-char');
            if (char && alphabetMap[char] !== undefined) {
                if (activeDragChar !== char) {
                    setActiveDragChar(char);
                    onScrollRequest(alphabetMap[char]);

                    // Provide haptic feedback if available (mobile)
                    if (navigator.vibrate) {
                        navigator.vibrate(5);
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
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <>
            <div className="fixed right-1 top-1/2 -translate-y-[45%] z-50 flex flex-col items-center gap-0.5 pointer-events-auto touch-none">
                {/* Large Bubble Indicator */}
                <AnimatePresence>
                    {isDragging && activeDragChar && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: -40 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute top-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900/90 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-xl backdrop-blur-md"
                            style={{
                                top: containerRef.current
                                    ? (() => {
                                        // Calculate position relative to the current active button would be complex without state.
                                        // Simpler: Keep bubble fixed center or follow Y? 
                                        // User requested "Pop-out when sliding". 
                                        // Let's make it follow the Y of the finger?
                                        // Actually fixed to the side of the bar is fine for now, or just fixed center of screen?
                                        // Let's just put it to the left of the bar.
                                        return '50%';
                                    })()
                                    : '50%'
                            }}
                        >
                            {activeDragChar}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    ref={containerRef}
                    className="flex flex-col gap-[1px] bg-white/40 backdrop-blur-md py-2 px-1 rounded-full shadow-lg border border-white/20 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
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
                                    "w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full transition-all duration-150 select-none shrink-0",
                                    isActive
                                        ? "text-gray-500 hover:text-blue-600"
                                        : "text-gray-300/50 cursor-default",
                                    isHighlighted && "scale-150 text-blue-600 font-extrabold"
                                )}
                                // Prevent click from bubbling if needed, but pointer events handle main logic
                                onClick={(e) => e.preventDefault()}
                            >
                                {char}
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    );
}
