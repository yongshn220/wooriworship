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

                    {/* 1. Key / Icon Indicator (Like Checkbox/Track Num) */}
                    <div className="w-12 sm:w-16 flex justify-center shrink-0">
                        {song.keys && song.keys.length > 0 ? (
                            <div className="font-mono font-bold text-sm bg-blue-50 text-blue-600 w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                {song.keys[0]}
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <Music2 size={14} />
                            </div>
                        )}
                    </div>

                    {/* 2. Main Title & Subtitle */}
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
                        {/* Mobile-only author */}
                        <p className="text-xs text-gray-500 sm:hidden truncate mt-0.5">
                            {song.original?.author || "Unknown"}
                        </p>
                    </div>

                    {/* 3. Author (Desktop) */}
                    <div className="w-1/4 hidden md:flex items-center text-sm text-gray-500 truncate">
                        {song.original?.author || "-"}
                    </div>

                    {/* 4. Tags (Tablet+) */}
                    <div className="hidden lg:flex gap-1.5 w-1/5 justify-end overflow-hidden">
                        {song.tags?.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] px-1.5 h-5 font-normal">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    {/* 5. Last Used & Hover Arrow */}
                    <div className="w-20 sm:w-1/5 flex justify-end items-center text-xs text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="group-hover:text-blue-400" />
                            <span>{getTimePassedFromTimestampShorten(song.last_used_time)}</span>
                        </div>
                    </div>

                </div>
            </SongDetailDialogTrigger>
        </motion.div>
    );
}
