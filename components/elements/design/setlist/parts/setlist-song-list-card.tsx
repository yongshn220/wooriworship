"use client";

import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";
import { useState } from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";
import { SectionHeader, SectionCardContainer } from "@/components/common/section-card";

import { Song } from "@/models/song";

interface Props {
    songs: Song[];
    teamId: string;
    onEdit?: () => void;
}

export function SetlistSongListCard({ songs = [], teamId, onEdit }: Props) {
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            <SectionHeader
                icon={Music}
                iconColorClassName="bg-primary/10 text-primary"
                title="Songs"
                badge={`${songs?.length || 0}`}
                onEdit={onEdit}
            />

            <SectionCardContainer>
                {songs && songs.length > 0 ? (
                    <div className="divide-y divide-border">
                        {songs.map((song, idx) => {
                            if (!song) return null;
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
            </SectionCardContainer>

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
