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
        <div
            className="relative transition-colors duration-200 group min-h-[80px] hover:bg-muted/50"
        >
            <SongDetailDialogTrigger teamId={teamId} songId={songId}>
                <div className="flex items-center w-full h-full p-3 sm:p-5 gap-3 cursor-pointer">

                    {/* Left Column: Content (Title/Subtitle, Author, Key) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 h-full px-1">

                        {/* Row 1: Title + Subtitle (Max 1 line) */}
                        <div className="flex items-baseline gap-2 min-w-0">
                            <div className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate leading-tight -tracking-[0.03em]">
                                {song.title}
                            </div>
                            {song.subtitle && (
                                <span className="text-sm font-normal text-muted-foreground truncate hidden sm:inline-block">
                                    {song.subtitle}
                                </span>
                            )}
                        </div>

                        {/* Row 2: Author */}
                        <div className="text-sm text-muted-foreground truncate">
                            {song.original?.author || "Unknown"}
                        </div>

                        {/* Row 3: Keys */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {song.keys && song.keys.length > 0 ? (
                                song.keys.map((key, i) => (
                                    <span key={i} className="font-mono text-xs sm:text-sm font-bold text-muted-foreground border border-border bg-muted/50 px-1.5 py-0.5 rounded-[4px] min-w-[1.25rem] text-center leading-none">
                                        {key}
                                    </span>
                                ))
                            ) : (
                                <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-muted-foreground/50">
                                    <Music2 size={12} />
                                </div>
                            )}
                        </div>
                    </div>



                </div>
            </SongDetailDialogTrigger>
        </div>
    );
}
