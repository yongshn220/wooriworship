"use client";

import { FileMusic, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";
import { SectionHeader, SectionCardContainer } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";

import { Song } from "@/models/song";

interface Props {
    songs: Song[];
    teamId: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onSetlistView?: () => void;
}

export function SetlistSongListCard({ songs = [], teamId, onEdit, onDelete, onSetlistView }: Props) {
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

    return (
        <div data-testid="setlist-card">
            <SectionCardContainer>
                <SectionHeader
                    icon={FileMusic}
                    iconColorClassName="bg-primary/10 text-primary"
                    title="Setlist"
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                {songs && songs.length > 0 ? (
                    <div className="divide-y divide-border">
                        {songs.map((song, idx) => {
                            if (!song) return null;
                            return (
                                <div
                                    key={song.id || idx}
                                    className="grid grid-cols-[2.5rem_1fr_1.1fr] gap-3 px-3 py-3 items-center hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => song.id && setSelectedSongId(song.id)}
                                >
                                    <div className="text-muted-foreground font-mono text-xs font-medium">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="font-semibold text-sm text-foreground leading-tight truncate">
                                        {song.title || "Untitled"}
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        {song?.keys?.[0] ? (
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-sm whitespace-nowrap bg-card border-border text-muted-foreground">
                                                {song.keys[0]}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
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
                {onSetlistView && (
                    <div className="flex justify-end px-3 py-2 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={onSetlistView}
                            className="text-primary hover:bg-primary/5 font-semibold h-9 rounded-xl px-3 text-sm flex items-center gap-1.5"
                        >
                            View Setlist
                            <ArrowRight className="w-4 h-4" />
                        </Button>
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
