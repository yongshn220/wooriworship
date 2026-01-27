"use client";

import { ServiceSetlist } from "@/models/services/ServiceEvent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music2 } from "lucide-react";
import { EmptyStateCard } from "@/components/elements/design/common/empty-state-card";

interface Props {
    setlist: ServiceSetlist | null;
    className?: string;
}

export function SetlistCard({ setlist, className }: Props) {
    const hasSongs = setlist && setlist.songs.length > 0;

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Music2 className="w-4 h-4" />
                        Set List
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {!hasSongs ? (
                    <EmptyStateCard
                        icon={Music2}
                        message="No songs added yet"
                        description="Add songs to create a setlist"
                        className="py-6"
                    />
                ) : (
                    <div className="space-y-3">
                        {/* Songs List */}
                        <div className="space-y-2">
                            {setlist!.songs.map((song, idx) => (
                                <div key={song.id || idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <span className="text-xs font-mono text-muted-foreground w-4 text-center">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{song.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{song.key}</span>
                                            {song.artist && <span>• {song.artist}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
