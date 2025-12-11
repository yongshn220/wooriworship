"use client"

import { useRecoilValue } from "recoil";
import { songAtom } from "@/global-states/song-state";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Hash, Music2, PlusIcon } from "lucide-react";
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
            className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm transition-all duration-200 group h-[64px] sm:h-[100px]"
        >
            <SongDetailDialogTrigger teamId={teamId} songId={songId}>
                <div className="flex items-center w-full h-full p-1 sm:p-5 gap-1.5 sm:gap-3 cursor-pointer">

                    {/* Left Column: Content (Title/Subtitle, Author, Key) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 sm:py-1 px-1">

                        {/* Row 1: Title + Subtitle (Max 1 line) */}
                        <div className="text-[14px] sm:text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate leading-tight -tracking-[0.03em]">
                            {song.title}
                            {song.subtitle && (
                                <span className="text-[11px] sm:text-sm font-normal text-gray-400 ml-1.5 sm:ml-2 align-baseline">
                                    {song.subtitle}
                                </span>
                            )}
                        </div>

                        {/* Row 2: Author */}
                        <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-auto mb-0.5">
                            {song.original?.author || "Unknown"}
                        </div>

                        {/* Row 3: Keys */}
                        <div className="flex items-center gap-1">
                            {song.keys && song.keys.length > 0 ? (
                                song.keys.map((key, i) => (
                                    <span key={i} className="font-mono text-[9px] sm:text-[10px] font-bold text-gray-500 border border-gray-200 bg-gray-50/50 px-1 py-[1px] sm:px-1.5 sm:py-0.5 rounded-[4px] min-w-[1.1rem] sm:min-w-[1.25rem] text-center leading-none">
                                        {key}
                                    </span>
                                ))
                            ) : (
                                <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-300">
                                    <Music2 size={10} className="sm:w-3 sm:h-3" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Plus Icon (Narrower) */}
                    <div className="w-5 sm:w-10 flex justify-center items-center text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 border-l border-gray-100 pl-0.5 sm:pl-3 h-2/3">
                        <PlusIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>

                </div>
            </SongDetailDialogTrigger>
        </motion.div>
    );
}
