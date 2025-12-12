"use client"

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { songAlphabetMapAtom } from "@/global-states/song-state";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
    teamId: string;
    onScrollRequest: (index: number) => void;
    activeIndex: number;
}

const ITEM_HEIGHT = 40; // Height of each character item
const VISIBLE_ITEMS = 7; // Number of items visible above/below center
const WHEEL_RADIUS = 150; // Radius of the 3D wheel

export function AlphabetIndexer({ teamId, onScrollRequest, activeIndex }: Props) {
    const alphabetMap = useRecoilValue(songAlphabetMapAtom(teamId));
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [selectedChar, setSelectedChar] = useState<string | null>(null);
    const isSyncing = useRef(false);
    const isUserInteracting = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Order: # -> English -> Korean
    const chars = useMemo(() => {
        const korean = [
            'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        // English 'A' to 'Z'
        const english = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

        return ['#', ...english, ...korean];
    }, []);

    // Sync from List -> Indexer
    useEffect(() => {
        // If user is currently dragging/scrolling the wheel, ignore updates from the list
        if (isUserInteracting.current) return;

        // Find the char that corresponds to activeIndex
        let targetChar = '#';

        // Iterate chars to find the range
        // alphabetMap maps Char -> Start Index
        // We want the char where map[char] <= activeIndex
        // Since chars are ordered, we can just iterate.
        let maxIndex = -1;

        for (const char of chars) {
            const index = alphabetMap[char];
            if (index !== undefined) {
                if (index <= activeIndex && index > maxIndex) {
                    maxIndex = index;
                    targetChar = char;
                }
            }
        }

        if (targetChar !== selectedChar) {
            isSyncing.current = true;
            setSelectedChar(targetChar);

            // Scroll wheel to this char
            const charIndex = chars.indexOf(targetChar);
            if (charIndex !== -1 && containerRef.current) {
                containerRef.current.scrollTo({
                    top: charIndex * ITEM_HEIGHT,
                    behavior: 'smooth'
                });
            }

            // Release lock after animation
            setTimeout(() => {
                isSyncing.current = false;
            }, 800);
        }
    }, [activeIndex, alphabetMap, chars, selectedChar]);

    // Handle Scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        isUserInteracting.current = true; // Mark as interaction

        const newScrollTop = e.currentTarget.scrollTop;
        setScrollTop(newScrollTop);

        // If syncing from list, do NOT trigger list scroll back
        // But if isUserInteracting is true (which we just set), we assume user intent... 
        // Wait, isSyncing is set when PROGRAM starts scrolling.
        if (isSyncing.current) {
            isUserInteracting.current = false; // It's not user interaction if it's sync
            return;
        }

        // Calculate center item
        const centerIndex = Math.round(newScrollTop / ITEM_HEIGHT);
        const safeIndex = Math.max(0, Math.min(centerIndex, chars.length - 1));
        const char = chars[safeIndex];

        if (char !== selectedChar) {
            setSelectedChar(char);
            if (alphabetMap[char] !== undefined) {
                // Debounce the actual scroll request
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }

                scrollTimeoutRef.current = setTimeout(() => {
                    onScrollRequest(alphabetMap[char]);
                }, 300);

                if (navigator.vibrate) navigator.vibrate(5);
            }
        }
    };

    // User interaction unlocks sync
    const handleUserInteract = () => {
        isSyncing.current = false;
        isUserInteracting.current = true;
    }

    // Scroll Sync to center items
    const handleScrollEnd = () => {
        if (!containerRef.current) return;

        // Reset user interaction flag after snap or stop
        // Use a slight delay to ensure list has time to start moving if we commanded it
        // Ideally, we keep it true until the list arrives? 
        // No, keep it true for a short duration is simpler.
        setTimeout(() => {
            isUserInteracting.current = false;
        }, 500);

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
        <div
            className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 h-[500px] w-12 flex items-center justify-center pointer-events-auto select-none"
            onPointerDown={handleUserInteract}
            onTouchStart={handleUserInteract}
        >

            {/* Selection Pointer / Highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-8 bg-primary/20 backdrop-blur-sm border border-primary/50 rounded-lg shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-0 pointer-events-none" />
            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-primary border-b-[6px] border-b-transparent hidden sm:block" />

            {/* 3D Wheel Container */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full w-full overflow-y-scroll scrollbar-hide relative perspective-[500px]"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <div className="relative w-full" style={{ height: (chars.length - 1) * ITEM_HEIGHT + 500 }}>
                    {chars.map((char, i) => {
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
                                        ? (isActive ? 'var(--primary)' : 'var(--muted-foreground)') // primary : muted
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
                </div>
            </div>
        </div>
    );
}
