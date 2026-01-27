"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Music, Settings2 } from "lucide-react"; // Changed icon to verify library availability, maybe Pencil? Let's use generic Edit icon or Settings?
// User has 'lucide-react'. Let's use 'Edit' or 'Pencil'.
import { Edit } from "lucide-react";
import { useState } from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";

import { Song } from "@/models/song";

interface Props {
    songs: Song[];
    teamId: string;
    onEdit?: () => void;
}

export function SetlistSongListCard({ songs = [], teamId, onEdit }: Props) {
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    <h3 className="text-lg font-bold">Songs</h3>
                    <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-xs">
                        {songs?.length || 0}
                    </Badge>
                </div>
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                {songs && songs.length > 0 ? (
                    <div className="divide-y divide-border/40">
                        {songs.map((song, idx) => {
                            if (!song) return null; // Defensive check for null songs
                            return (
                                <div
                                    key={song.id || idx}
                                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer active:bg-muted/50"
                                    onClick={() => song.id && setSelectedSongId(song.id)}
                                >
                                    <div className="w-8 text-center shrink-0 text-sm font-bold text-muted-foreground/50">
                                        {idx + 1}
                                    </div>
                                    <div className="w-10 flex justify-center shrink-0">
                                        {song?.keys?.[0] ? (
                                            <Badge variant="outline" className="font-mono text-sm font-bold border-border bg-muted/20 px-1.5">
                                                {song.keys[0]}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground truncate">
                                            {song.title || "Untitled"}
                                        </h4>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground italic">
                        No songs added yet.
                    </div>
                )}
            </div>

            {/* Song Detail Drawer */}
            {selectedSongId && (
                <SongDetailDialog
                    teamId={teamId}
                    isOpen={!!selectedSongId}
                    setIsOpen={(open: boolean) => !open && setSelectedSongId(null)}
                    songId={selectedSongId}
                    readOnly={true}
                />
            )}
        </div>
    );
}
