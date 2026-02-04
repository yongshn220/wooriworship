"use client";

import { FileMusic, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SongDetailDialog } from "@/components/elements/design/song/song-detail-card/default/song-detail-dialog";
import { SectionHeader, SectionCardContainer } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";

interface SetlistSongItem {
    id: string;
    title: string;
    key?: string;
    keyNote?: string;
}

interface Props {
    songs: SetlistSongItem[];
    teamId: string;
    onEdit?: () => void;
    onDownload?: () => void;
    onDelete?: () => void;
    onSetlistView?: () => void;
}

export function SetlistSongListCard({ songs = [], teamId, onEdit, onDownload, onDelete, onSetlistView }: Props) {
    const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

    return (
        <div data-testid="setlist-card">
            <SectionCardContainer>
                <SectionHeader
                    icon={FileMusic}
                    iconColorClassName="bg-primary/10 text-primary"
                    title="Setlist"
                    onEdit={onEdit}
                    onDownload={onDownload}
                    onDelete={onDelete}
                />
                {songs && songs.length > 0 ? (
                    <div className="divide-y divide-border">
                        {songs.map((song, idx) => {
                            if (!song) return null;
                            return (
                                <div
                                    key={song.id || idx}
                                    className="flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => song.id && setSelectedSongId(song.id)}
                                >
                                    <div className="text-muted-foreground font-mono text-xs font-medium w-6 shrink-0">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                                            {song.title || "Untitled"}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        {song?.key ? (
                                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-sm whitespace-nowrap bg-card border-border text-muted-foreground">
                                                {song.key}
                                                {song.keyNote && <span className="font-medium text-muted-foreground/70">{song.keyNote}</span>}
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
