"use client";

import { Worship } from "@/models/worship";
import { WorshipInfoCard } from "./parts/worship-info-card";
import { WorshipSongListCard } from "./parts/worship-song-list-card";
import { Button } from "@/components/ui/button";
import { Play, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { getPathWorshipView } from "@/components/util/helper/routes";

interface Props {
    worship: Worship;
    songs: any[];
    teamId: string;
    servingId?: string;
}

export function WorshipDetailView({ worship, songs, teamId, servingId }: Props) {
    const router = useRouter();

    const handleStartWorship = () => {
        router.push(getPathWorshipView(teamId, worship.id));
    };

    return (
        <div className="space-y-5 pb-24">
            <WorshipInfoCard
                worshipId={worship.id || ""}
                title={worship.title || "Worship Plan"}
                subtitle={worship.subtitle}
                date={worship.worship_date}
                teamId={teamId}
                createdById={worship.created_by.id}
                servingId={servingId}
            />

            {/* Actions */}
            {worship.link && (
                <div className="w-full">
                    <Button variant="outline" asChild className="w-full gap-2 h-11 border-border shadow-sm">
                        <a href={worship.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            Link
                        </a>
                    </Button>
                </div>
            )}

            {/* Songs */}
            <WorshipSongListCard
                songs={songs}
                teamId={teamId}
            />

            {/* Description (if any) */}
            {worship.description && (
                <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Note</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {worship.description}
                    </p>
                </div>
            )}

            {/* Start Button Area (Fixed or Inline?) */}
            {/* Let's keep it inline for now or fixed at bottom? Serving board has safe area padding. */}
            <div className="pt-4">
                <Button
                    size="lg"
                    className="w-full h-12 text-lg font-bold rounded-xl shadow-md gap-2"
                    onClick={handleStartWorship}
                >
                    <Play className="h-5 w-5 fill-current" />
                    Start Worship
                </Button>
            </div>
        </div>
    );
}
