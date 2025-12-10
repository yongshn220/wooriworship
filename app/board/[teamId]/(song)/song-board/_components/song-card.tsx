"use client"

import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Hash, Music2 } from "lucide-react";
import { getTimePassedFromTimestampShorten } from "@/components/util/helper/helper-functions";
import { SongDetailDialogTrigger } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger";
import { cn } from "@/lib/utils";

interface Props {
    teamId: string;
    songId: string;
    index: number;
}

export function SongCard({ teamId, songId, index }: Props) {
    const song = useRecoilValue(songAtom(songId));

    if (!song) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.03
            }}
            whileHover={{
                scale: 1.01,
                x: 4,
                zIndex: 10,
                backgroundColor: "rgba(255, 255, 255, 1)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            }}
            className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm transition-all duration-200 group"
        >
            <SongDetailDialogTrigger teamId={teamId} songId={songId}>
                <div className="flex items-center w-full p-3 sm:px-6 sm:py-3.5 gap-4 cursor-pointer">

                    {/* 1. Main Title & Subtitle & Author */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-baseline gap-2">
                            <h3 className="font-bold text-base text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                                {song.title}
                            </h3>
                            {song.subtitle && (
                                <span className="text-xs text-gray-400 truncate hidden sm:inline-block">
                                    {song.subtitle}
                                </span>
                            )}
                        </div>
                        {/* Author below title */}
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                            {song.original?.author || "Unknown"}
                        </p>
                    </div>

                    {/* 2. Key / Icon Indicator (Far Right) */}
                    <div className="w-32 flex justify-center shrink-0">
                        {song.keys && song.keys.length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-1 w-full">
                                {song.keys.map((key, i) => (
                                    <span key={i} className="font-mono text-[10px] sm:text-xs font-medium text-gray-500 border border-gray-200 bg-gray-50/50 px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center">
                                        {key}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
                                <Music2 size={14} />
                            </div>
                        )}
                    </div>

                </div>
            </SongDetailDialogTrigger>
        </motion.div>
    );
}
