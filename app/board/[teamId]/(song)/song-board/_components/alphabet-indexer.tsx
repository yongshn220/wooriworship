"use client"

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { songAlphabetMapAtom } from "@/global-states/song-state";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
    teamId: string;
    onScrollRequest: (index: number) => void;
}

const ITEM_HEIGHT = 40; // Height of each character item
const VISIBLE_ITEMS = 7; // Number of items visible above/below center
const WHEEL_RADIUS = 150; // Radius of the 3D wheel

export function AlphabetIndexer({ teamId, onScrollRequest }: Props) {
    const alphabetMap = useRecoilValue(songAlphabetMapAtom(teamId));
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [selectedChar, setSelectedChar] = useState<string | null>(null);

    // Order: # -> English -> Korean
    const chars = useMemo(() => {
        const korean = [
            'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        // English 'A' to 'Z'
        const english = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

        return ['#', ...english, ...korean];
    }, []);

    // Handle Scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const newScrollTop = e.currentTarget.scrollTop;
        setScrollTop(newScrollTop);

        // Calculate center item
        const centerIndex = Math.round(newScrollTop / ITEM_HEIGHT);
        const safeIndex = Math.max(0, Math.min(centerIndex, chars.length - 1));
        const char = chars[safeIndex];

        if (char !== selectedChar) {
            setSelectedChar(char);
            if (alphabetMap[char] !== undefined) {
                // Debounce or immediate? Immediate for now as per "wheel" feel, maybe throttle if performance bad
                onScrollRequest(alphabetMap[char]);

                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(5);
                }
            }
        }
    };

    // Scroll Sync to center items
    const handleScrollEnd = () => {
        if (!containerRef.current) return;

        const currentScroll = containerRef.current.scrollTop;
        const nearestIndex = Math.round(currentScroll / ITEM_HEIGHT);
        const targetScroll = nearestIndex * ITEM_HEIGHT;

        if (Math.abs(currentScroll - targetScroll) > 1) {
            containerRef.current.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }

    // Detect scroll stop for snapping
    useEffect(() => {
        const container = containerRef.current;
        let timeoutId: NodeJS.Timeout;

        const onScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScrollEnd, 100);
        };

        container?.addEventListener('scroll', onScroll);
        return () => {
            container?.removeEventListener('scroll', onScroll);
            clearTimeout(timeoutId);
        }
    }, []);


    return (
        <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 h-[500px] w-12 flex items-center justify-center pointer-events-auto select-none">

            {/* Selection Pointer / Highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-8 bg-blue-500/20 backdrop-blur-sm border border-blue-500/50 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] z-0 pointer-events-none" />
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-blue-500 border-b-[6px] border-b-transparent hidden sm:block" />

            {/* 3D Wheel Container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll scrollbar-hide snap-y snap-mandatory relative perspective-[500px]"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <div className="relative w-full" style={{ height: (chars.length + VISIBLE_ITEMS * 2) * ITEM_HEIGHT }}>
                    {chars.map((char, i) => {
                        // Calculate relative position to center
                        // We add padding (VISIBLE_ITEMS * ITEM_HEIGHT) to top/bottom so first/last items can be centered
                        // The actual item index in the scrollable area needs to account for this padding if we rendered padding divs, 
                        // but here let's simplify: we'll pad the top/bottom of the container list with huge margins or spacer divs?
                        // Better: Render items absolutely positioned or just transformed based on scroll?
                        // Standard scroll approach: List is tall. 
                        // We need 'padding' visually. Let's add paddingTop/Bottom to container internal div.

                        // Refined Math: 
                        // The scrollable area height should allow index 0 to be at scrollTop 0? No, scrollTop 0 means index 0 is at top. We want index 0 to be at CENTER.
                        // So we need clear padding top = containerHeight/2 - itemHeight/2.

                        // Dynamic container height check would be better, but for now we sync with CSS class
                        // Adjusted Physics for better visibility
                        const containerHeight = 500;

                        const relativeY = (i * ITEM_HEIGHT) - scrollTop;

                        // Angle calculation:
                        // Slower rotation per pixel to keep more items in view without them rotating away too fast.
                        const angle = relativeY / (ITEM_HEIGHT * 2.5);
                        const rotateX = -angle * 25;

                        // Opacity & Scale:
                        const distance = Math.abs(relativeY);
                        // Much slower falloff to keep neighbors visible
                        const opacity = Math.max(0.15, 1 - distance / (containerHeight * 0.7));
                        const scale = Math.max(0.65, 1 - distance / (containerHeight * 1.2));

                        // Curve depth
                        const translateZ = Math.cos(angle) * 40 - 40;

                        const isActive = alphabetMap[char] !== undefined;

                        // Render if it has any significant opacity
                        if (opacity < 0.1) return null;

                        return (
                            <div
                                key={char}
                                className={cn(
                                    "absolute left-0 w-full flex items-center justify-center transition-all duration-75 will-change-transform",
                                    isActive ? "cursor-pointer" : "pointer-events-none"
                                )}
                                style={{
                                    height: ITEM_HEIGHT,
                                    top: (i * ITEM_HEIGHT) + 230, // center offset
                                    transform: `
                        perspective(500px)
                        rotateX(${rotateX}deg)
                        scale(${scale})
                        translateZ(${translateZ}px)
                    `,
                                    opacity: isActive ? opacity : opacity * 0.4,
                                    zIndex: Math.round(100 - distance),
                                    // Colors optimized for Light Mode (with dark text)
                                    color: char === selectedChar
                                        ? (isActive ? '#2563eb' : '#9ca3af') // blue-600 : gray-400
                                        : 'rgba(0,0,0,0.4)',
                                    visibility: opacity < 0.1 ? 'hidden' : 'visible'
                                }}
                            >
                                <span className={cn(
                                    "text-sm font-bold transition-colors duration-200",
                                    char === selectedChar ? "text-xl" : "",
                                    // Remove Tailwind text classes that conflict with inline styles for color, or keep them if they are strictly structure
                                    // We rely on inline color for the gradient effect usually, but let's stick to simple classes for selected
                                )}>
                                    {char === '#' ? '•' : char}
                                </span>
                            </div>
                        );
                    })}
                    {/* Spacer at bottom to allow scrolling last item to center */}
                    <div style={{ height: (chars.length) * ITEM_HEIGHT + 260 }} className="w-px pointer-events-none opacity-0" />
                </div>
            </div>
        </div>
    );
}
