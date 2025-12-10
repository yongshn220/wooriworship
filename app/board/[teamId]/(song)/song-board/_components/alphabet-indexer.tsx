"use client"

import React, { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { songAlphabetMapAtom } from "@/global-states/song-state";
import { cn } from "@/lib/utils";

interface Props {
    teamId: string;
    onScrollRequest: (index: number) => void;
}

export function AlphabetIndexer({ teamId, onScrollRequest }: Props) {
    const alphabetMap = useRecoilValue(songAlphabetMapAtom(teamId));

    // Define the master list of characters to display
    // # (Other), Korean (ㄱ-ㅎ), English (A-Z)
    const chars = useMemo(() => {
        const korean = [
            'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        // English 'A' to 'Z'
        const english = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

        return ['#', ...korean, ...english];
    }, []);

    const handleClick = (char: string) => {
        // If the map has the char, scroll to it
        // If not, maybe find the "next closest" or just do nothing?
        // Let's scroll to the exact match first.
        if (alphabetMap[char] !== undefined) {
            onScrollRequest(alphabetMap[char]);
        } else {
            // Optional: Find nearest previous char? For now, do nothing if empty.
        }
    };

    return (
        <div className="fixed right-2 top-1/2 -translate-y-[45%] z-50 flex flex-col items-center gap-0.5 pointer-events-auto">
            <div
                className="flex flex-col gap-[2px] bg-white/50 backdrop-blur-sm p-1 rounded-full shadow-lg border border-gray-100 max-h-[70vh] overflow-y-auto no-scrollbar"
                // Prevent scroll chaining to parent
                onWheel={(e) => e.stopPropagation()}
            >
                {chars.map((char) => {
                    const isActive = alphabetMap[char] !== undefined;
                    return (
                        <button
                            key={char}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isActive) handleClick(char);
                            }}
                            className={cn(
                                "w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full transition-all duration-200 select-none",
                                isActive
                                    ? "text-gray-600 hover:text-blue-600 hover:bg-white hover:scale-125 hover:shadow-sm cursor-pointer"
                                    : "text-gray-300 cursor-default"
                            )}
                        >
                            {char}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
